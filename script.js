const ingredientsMain = {
    protein: ["Shrimp", "Chicken", "Beef", "Pork", "Tofu", "Eggs", "Salmon", "Lentils"],
    produce: ["Zucchini", "Spinach", "Bell Peppers", "Sweet Potato", "Broccoli", "Mushrooms", "Tomato"],
    carb: ["Pasta", "Rice", "Quinoa", "Potato", "Bread", "Couscous"],
    wildcard: ["Cumin", "Honey", "Lemon", "Soy Sauce", "Garlic", "Chili Flakes", "Miso"]
};

const ingredientsDrink = {
    base: ["Coconut Water", "Green Tea", "Sparkling Water", "Apple Juice", "Milk"],
    flavor: ["Mint", "Ginger", "Berries", "Cucumber", "Lime", "Vanilla"]
};

// --- PERSISTENCE LOGIC ---
let results = JSON.parse(localStorage.getItem('midtermPicks')) || { m1: [], m2: [], bev: [] };
let currentRound = parseInt(localStorage.getItem('midtermRound')) || 1;
let appState = localStorage.getItem('midtermState') || 'randomizing'; // randomizing, forms, finished

window.onload = function() {
    if (appState === 'finished') {
        // Direct to final screen if already submitted
        showFinalDisplay();
    } else if (appState === 'forms') {
        showForm();
    } else if (results.m1.length > 0) {
        // Restore partial progress
        restoreRandomizer();
    }
};

function restoreRandomizer() {
    if (currentRound === 2) {
        updateSlots(results.m1);
        document.getElementById('round-title').innerText = "🥘 Round 2: Main Dish 2";
        document.getElementById('generate-btn').innerText = "Randomize Main 2";
    } else if (currentRound === 3) {
        updateSlots(results.m2);
        setupDrinkUI();
    }
}

function updateSlots(picks) {
    picks.forEach((val, i) => {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) slot.innerText = val;
    });
}

const genBtn = document.getElementById('generate-btn');
genBtn.addEventListener('click', async function() {
    this.disabled = true;
    let pool = (currentRound < 3) ? ingredientsMain : ingredientsDrink;
    let cats = (currentRound < 3) ? ['protein', 'produce', 'carb', 'wildcard'] : ['base', 'flavor'];

    for (let i = 0; i < cats.length; i++) {
        const slot = document.getElementById(`slot-${i}`);
        let options = (currentRound === 2) ? pool[cats[i]].filter(x => !results.m1.includes(x)) : pool[cats[i]];

        for (let j = 0; j < 8; j++) {
            slot.innerText = options[Math.floor(Math.random() * options.length)];
            await new Promise(r => setTimeout(r, 60));
        }

        const choice = options[Math.floor(Math.random() * options.length)];
        slot.innerText = choice;
        
        if (currentRound === 1) results.m1.push(choice);
        else if (currentRound === 2) results.m2.push(choice);
        else results.bev.push(choice);

        localStorage.setItem('midtermPicks', JSON.stringify(results));
        await new Promise(r => setTimeout(r, 500));
    }

    currentRound++;
    localStorage.setItem('midtermRound', currentRound);
    this.disabled = false;
    
    if (currentRound === 2) {
        document.getElementById('round-title').innerText = "🥘 Round 2: Main Dish 2";
        this.innerText = "Randomize Main 2";
    } else if (currentRound === 3) {
        setupDrinkUI();
    } else {
        appState = 'forms';
        localStorage.setItem('midtermState', 'forms');
        showForm();
    }
});

function setupDrinkUI() {
    document.getElementById('round-title').innerText = "🥤 Round 3: Beverage";
    document.querySelectorAll('.card')[2].style.display = "none";
    document.querySelectorAll('.card')[3].style.display = "none";
    genBtn.innerText = "Randomize Beverage";
    updateSlots(["?", "?"]);
}

function showForm() {
    document.getElementById('randomizer-section').style.display = "none";
    document.getElementById('recipe-section').style.display = "block";
    document.getElementById('final-summary').innerHTML = `<strong>Locked Ingredients:</strong> M1: ${results.m1.join(", ")} | M2: ${results.m2.join(", ")} | Drink: ${results.bev.join(", ")}`;
}

document.getElementById('recipe-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Save Form Data to show on final display
    const formData = {
        group: document.getElementById('group-name').value,
        members: Array.from(document.querySelectorAll('.member-input')).map(i => i.value).filter(v => v !== ""),
        m1Title: document.getElementById('m1-title').value,
        m1Steps: document.getElementById('m1-steps').value,
        m2Title: document.getElementById('m2-title').value,
        m2Steps: document.getElementById('m2-steps').value,
        bevTitle: document.getElementById('bev-title').value,
        bevSteps: document.getElementById('bev-steps').value
    };
    
    localStorage.setItem('finalSubmission', JSON.stringify(formData));
    localStorage.setItem('midtermState', 'finished');
    showFinalDisplay();
});

function showFinalDisplay() {
    const data = JSON.parse(localStorage.getItem('finalSubmission'));
    if (!data) return;

    document.getElementById('display-group-name').innerText = data.group.toUpperCase();
    const banner = document.getElementById('display-members-list');
    banner.innerHTML = data.members.map(m => `<span>• Chef ${m}</span>`).join("");

    const container = document.getElementById('tables-container');
    container.innerHTML = "";
    container.appendChild(createTable("MAIN DISH 1", data.m1Title, results.m1, data.m1Steps));
    container.appendChild(createTable("MAIN DISH 2", data.m2Title, results.m2, data.m2Steps));
    container.appendChild(createTable("BEVERAGE", data.bevTitle, results.bev, data.bevSteps));

    document.getElementById('randomizer-section').style.display = "none";
    document.getElementById('recipe-section').style.display = "none";
    document.getElementById('display-section').style.display = "block";
    window.scrollTo(0,0);
}

function createTable(type, title, items, steps) {
    const div = document.createElement('div');
    div.className = "recipe-card";
    div.innerHTML = `
        <table class="menu-table">
            <thead><tr><th colspan="2">🍳 ${type}</th></tr></thead>
            <tbody>
                <tr><td class="label-cell">Title</td><td style="font-weight:bold; color:#e67e22;">${title}</td></tr>
                <tr><td class="label-cell">Mystery Items</td><td>${items.join(" • ")}</td></tr>
                <tr><td class="label-cell">Preparation</td><td style="white-space:pre-wrap;">${steps}</td></tr>
            </tbody>
        </table>
    `;
    return div;
}