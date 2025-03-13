document.addEventListener("DOMContentLoaded", function () {
    Promise.all([
        fetch("veg.json").then(response => response.json()).catch(error => console.error("Error loading veg.json:", error)),
        fetch("Nonveg.json").then(response => response.json()).catch(error => console.error("Error loading Nonveg.json:", error))
    ])
        .then(([vegData, nonvegData]) => {
            if (vegData) populateMenu(vegData, "vegetarian-menu");
            if (nonvegData) populateMenu(nonvegData, "nonvegetarian-menu");
        })
        .catch(error => console.error("Error fetching menu data:", error));

    fetchUPIDetails();  // Fetch UPI details

    // Fix: Ensure event listener is added after DOM loads
    const payBillBtn = document.getElementById("pay-bill-btn");
    if (payBillBtn) {
        payBillBtn.addEventListener("click", function () {
            console.log("Pay Bill button clicked");
            shareOnWhatsApp();
        });
    } else {
        console.error("Pay Bill button not found.");
    }
});

function populateMenu(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    data.forEach(dish => {
        if (!dish.category) return;

        const categoryClass = dish.category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const dishElement = document.createElement("div");
        dishElement.classList.add("dish", categoryClass);

        let shortDesc = dish.description.length > 50 ? dish.description.substring(0, 50) + "..." : dish.description;
        let fullDesc = dish.description;

        dishElement.innerHTML = `
            <i class="fa fa-circle" style="font-size:14px; color: ${dish.veg ? 'green' : 'red'};">
                <span class="${dish.veg ? 'vegetarian' : 'non-vegetarian'}">
                    ${dish.veg ? 'VEGETARIAN' : 'NON-VEGETARIAN'}
                </span>
            </i>
            <div class="dish-content">
                <div class="dish-details">
                    <div class="dish-header">
                        <span class="dish-name">${dish.name}</span>
                            <span class="dish-price">Rs ${dish.price} </span>
                    </div>
                    <p class="dish-description" 
                        data-full="${fullDesc}" 
                        data-short="${shortDesc}">
                        ${window.innerWidth < 480 ? shortDesc + ' <span class="read-more" style="color: blue; cursor: pointer;">Read More</span>' : fullDesc}
                    </p>
                </div>
            </div>
            <div class="dish-footer">
                <span class="tag" onclick="filterDishes('${categoryClass}')">${dish.category}</span>
            </div>
        `;

        container.appendChild(dishElement);
    });
    handleReadMore();
}

function handleReadMore() {
    if (window.innerWidth >= 480) return;

    document.querySelectorAll(".dish-description").forEach(desc => {
        let shortText = desc.getAttribute("data-short");
        let fullText = desc.getAttribute("data-full");

        desc.innerHTML = shortText + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>';

        desc.addEventListener("click", function (event) {
            if (event.target.classList.contains("read-more")) {
                desc.innerHTML = fullText + ' <span class="read-less" style="color: #31B404; cursor: pointer;">Read Less</span>';
            } else if (event.target.classList.contains("read-less")) {
                desc.innerHTML = shortText + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>';
            }
        });
    });
}

function handleResize() {
    document.querySelectorAll(".dish-description").forEach(desc => {
        let fullText = desc.getAttribute("data-full");
        let shortText = desc.getAttribute("data-short");

        if (window.innerWidth >= 480) {
            desc.innerHTML = fullText;
        } else {
            desc.innerHTML = shortText + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>';
            handleReadMore();
        }
    });
}

window.addEventListener("resize", handleResize);
handleResize();
let whatsappNumber = "";
let upiId = "";

// Fetch restaurant details from header.json
fetch("header.json")
    .then(response => response.json())
    .then(data => {
        console.log("Loaded Data:", data); // Debugging log

        document.querySelector(".restaurant-name").textContent = data.restaurantName;
        document.querySelector(".restaurant-details").textContent = `${data.address} | ${data.contact}`;

        // Assign values correctly
        whatsappNumber = data.whatsappNumber || "";
        upiId = data.upiId || "";

        // Ensure WhatsApp number is properly formatted (without + sign)
        if (whatsappNumber.startsWith("+")) {
            whatsappNumber = whatsappNumber.replace("+", "");
        }

        console.log("WhatsApp Number:", whatsappNumber); // Debugging
        console.log("UPI ID:", upiId); // Debugging
    })
    .catch(error => console.error("Error loading header data:", error));

function shareOnWhatsApp() {
    if (!upiId || !whatsappNumber) {
        alert("UPI ID or WhatsApp number not found. Please try again later.");
        return;
    }

    const upiLink = `upi://pay?pa=${upiId}&pn=Restaurant&cu=INR`;
    const whatsappMessage = `Pay your bill using this UPI ID: ${upiLink}`;
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    console.log("Opening WhatsApp:", whatsappURL);
    window.open(whatsappURL, "_blank");
}

document.getElementById("toggle-nav").addEventListener("click", function () {
    document.getElementById("menu-container").style.display = "block";
    document.getElementById("footer-main").style.display = "none";
});
document.getElementById("toggle-nav").addEventListener("click", function () {
    document.getElementById("menu-container").style.display = "block";
    document.getElementById("footer-main").style.display = "none";

    // Hide footer-text when menu is open
    let footerText = document.querySelector(".footer-text");
    if (footerText) {
        footerText.style.display = "none";
    }
});

document.getElementById("hide-nav").addEventListener("click", function () {
    document.getElementById("menu-container").style.display = "none";
    document.getElementById("footer-main").style.display = "flex";

    // Show footer-text again when menu is hidden
    let footerText = document.querySelector(".footer-text");
    if (footerText) {
        footerText.style.display = "block";
    }
});


function filterDishes(category) {
    let allDishes = document.querySelectorAll('.dish');
    if (category === 'all') {
        allDishes.forEach(dish => dish.style.display = 'block');
    } else {
        allDishes.forEach(dish => dish.style.display = 'none');
        document.querySelectorAll(`.dish.${category}`).forEach(dish => dish.style.display = 'block');
    }
}

document.querySelectorAll("#menu-nav a").forEach(menuItem => {
    menuItem.addEventListener("click", function () {
        document.getElementById("menu-container").style.display = "none";
        document.getElementById("footer-main").style.display = "flex";
    });
});
