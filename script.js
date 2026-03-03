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

let currentRound = 1;
let results = { m1: [], m2: [], bev: [] };

document.getElementById('generate-btn').addEventListener('click', async function() {
    this.disabled = true;
    let pool = (currentRound < 3) ? ingredientsMain : ingredientsDrink;
    let cats = (currentRound < 3) ? ['protein', 'produce', 'carb', 'wildcard'] : ['base', 'flavor'];

    for (let i = 0; i < cats.length; i++) {
        const slot = document.getElementById(`slot-${i}`);
        let options = (currentRound === 2) ? pool[cats[i]].filter(x => !results.m1.includes(x)) : pool[cats[i]];

        // Shuffle Animation
        for (let j = 0; j < 8; j++) {
            slot.innerText = options[Math.floor(Math.random() * options.length)];
            await new Promise(r => setTimeout(r, 60));
        }

        const choice = options[Math.floor(Math.random() * options.length)];
        slot.innerText = choice;
        results[currentRound === 1 ? 'm1' : currentRound === 2 ? 'm2' : 'bev'].push(choice);
        await new Promise(r => setTimeout(r, 500));
    }

    currentRound++;
    this.disabled = false;
    
    if (currentRound === 2) {
        document.getElementById('round-title').innerText = "🥘 Round 2: Main Dish 2";
        this.innerText = "Randomize Main 2";
    } else if (currentRound === 3) {
        document.getElementById('round-title').innerText = "🥤 Round 3: Beverage";
        document.querySelectorAll('.card')[2].style.display = "none";
        document.querySelectorAll('.card')[3].style.display = "none";
        this.innerText = "Randomize Beverage";
    } else {
        document.getElementById('randomizer-section').style.display = "none";
        document.getElementById('recipe-section').style.display = "block";
        document.getElementById('final-summary').innerHTML = `<strong>Picks:</strong> M1: ${results.m1.join(", ")} | M2: ${results.m2.join(", ")} | Drink: ${results.bev.join(", ")}`;
    }
});

document.getElementById('recipe-form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('display-group-name').innerText = document.getElementById('group-name').value.toUpperCase();
    
    const banner = document.getElementById('display-members-list');
    banner.innerHTML = "";
    document.querySelectorAll('.member-input').forEach(input => {
        if(input.value.trim() !== "") banner.innerHTML += `<span style="margin:0 10px;">• Chef ${input.value}</span>`;
    });

    const container = document.getElementById('tables-container');
    container.innerHTML = "";
    container.appendChild(createRecipeCard("MAIN DISH 1", document.getElementById('m1-title').value, results.m1, document.getElementById('m1-steps').value));
    container.appendChild(createRecipeCard("MAIN DISH 2", document.getElementById('m2-title').value, results.m2, document.getElementById('m2-steps').value));
    container.appendChild(createRecipeCard("BEVERAGE", document.getElementById('bev-title').value, results.bev, document.getElementById('bev-steps').value));

    document.getElementById('recipe-section').style.display = "none";
    document.getElementById('display-section').style.display = "block";
});

function createRecipeCard(type, title, items, steps) {
    const div = document.createElement('div');
    div.className = "recipe-card";
    div.innerHTML = `
        <table class="menu-table">
            <thead><tr><th colspan="2">🍳 ${type}</th></tr></thead>
            <tbody>
                <tr><td class="label-cell">Title</td><td style="font-weight:bold; color:#e67e22;">${title}</td></tr>
                <tr><td class="label-cell">Mystery Items</td><td>${items.join(" • ")}</td></tr>
                <tr><td class="label-cell">Method</td><td style="white-space:pre-wrap;">${steps}</td></tr>
            </tbody>
        </table>
    `;
    return div;
}