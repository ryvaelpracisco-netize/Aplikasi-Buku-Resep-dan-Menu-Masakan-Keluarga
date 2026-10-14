
const recipeList = document.getElementById("recipeList");
const searchInput = document.getElementById("searchInput");
const recipeForm = document.getElementById("recipeForm");
const emptyMessage = document.getElementById("emptyMessage");
const formMessage = document.getElementById("formMessage");

// Resep contoh
const defaultRecipes = [
    {
        id: 1,
        name: "Nasi Goreng",
        category: "Makanan Utama",
        image: "images/nasi-goreng.jpg",
        ingredients: [
            "2 piring nasi putih",
            "2 siung bawang putih",
            "1 butir telur",
            "Kecap manis secukupnya",
            "Garam secukupnya"
        ],
        steps: [
            "Haluskan atau cincang bawang putih.",
            "Tumis bawang hingga harum.",
            "Masukkan telur dan aduk hingga matang.",
            "Tambahkan nasi, kecap, dan garam.",
            "Aduk hingga rata lalu sajikan."
        ]
    },
    {
        id: 2,
        name: "Soto Ayam",
        category: "Lauk",
        image: "images/soto-ayam.jpg",
        ingredients: [
            "500 gram ayam",
            "2 siung bawang putih",
            "1 liter air",
            "Garam secukupnya",
            "Daun bawang dan seledri"
        ],
        steps: [
            "Rebus ayam hingga matang.",
            "Siapkan bumbu dan tumis hingga harum.",
            "Masukkan bumbu ke dalam kuah ayam.",
            "Tambahkan garam sesuai selera.",
            "Sajikan dengan daun bawang dan seledri."
        ]
    },
    {
        id: 3,
        name: "Rendang Daging",
        category: "Lauk",
        image: "images/rendang.jpg",
        ingredients: [
            "500 gram daging sapi",
            "500 ml santan",
            "Bumbu rendang",
            "Garam secukupnya"
        ],
        steps: [
            "Potong daging sesuai selera.",
            "Masak santan bersama bumbu rendang.",
            "Masukkan daging ke dalam bumbu.",
            "Masak dengan api kecil sambil diaduk.",
            "Masak hingga daging empuk dan bumbu mengental."
        ]
    }
];

// Mengambil data resep dari browser
function loadRecipes() {
    try {
        const savedRecipes = localStorage.getItem("resepKeluarga");

        if (savedRecipes === null) {
            return defaultRecipes;
        }

        const parsedRecipes = JSON.parse(savedRecipes);

        return Array.isArray(parsedRecipes)
            ? parsedRecipes
            : defaultRecipes;
    } catch (error) {
        return defaultRecipes;
    }
}

let recipes = loadRecipes();

// Menyimpan data resep
function saveRecipes() {
    try {
        localStorage.setItem(
            "resepKeluarga",
            JSON.stringify(recipes)
        );
        return true;
    } catch (error) {
        formMessage.textContent =
            "Resep gagal disimpan. Periksa penyimpanan browser.";
        return false;
    }
}

// Membuat elemen teks agar input pengguna aman ditampilkan
function createTextElement(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
}

// Menampilkan daftar bahan atau langkah
function createList(items, type) {
    const list = document.createElement(type);

    items.forEach(item => {
        list.appendChild(createTextElement("li", item));
    });

    return list;
}

// Menampilkan kartu resep
function displayRecipes(keyword = "") {
    recipeList.replaceChildren();

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(
            keyword.trim().toLowerCase()
        )
    );

    emptyMessage.hidden = filteredRecipes.length > 0;

    filteredRecipes.forEach(recipe => {
        const card = document.createElement("article");
        card.className = "recipe-card";

        const image = document.createElement("img");
        image.src = recipe.image || "";
        image.alt = recipe.name;
        image.loading = "lazy";

        // Jika gambar belum tersedia, sembunyikan gambarnya.
        image.addEventListener("error", () => {
            image.hidden = true;
        });

        const content = document.createElement("div");
        content.className = "recipe-content";

        const title = createTextElement("h3", recipe.name);
        const category = createTextElement(
            "span",
            recipe.category
        );
        category.className = "category";

        content.append(title, category);

        content.appendChild(
            createTextElement("h4", "Bahan-bahan:")
        );
        content.appendChild(
            createList(recipe.ingredients, "ul")
        );

        content.appendChild(
            createTextElement("h4", "Langkah Memasak:")
        );
        content.appendChild(
            createList(recipe.steps, "ol")
        );

        // Tombol hapus
        const deleteButton = createTextElement(
            "button",
            "Hapus Resep"
        );
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            const confirmed = confirm(
                `Hapus resep ${recipe.name}?`
            );

            if (!confirmed) return;

            const previousRecipes = recipes;

            recipes = recipes.filter(
                item => item.id !== recipe.id
            );

            if (!saveRecipes()) {
                recipes = previousRecipes;
                return;
            }

            displayRecipes(searchInput.value);
            formMessage.textContent =
                "Resep berhasil dihapus.";
        });

        content.appendChild(deleteButton);
        card.append(image, content);
        recipeList.appendChild(card);
    });
}

// Fitur pencarian
searchInput.addEventListener("input", () => {
    displayRecipes(searchInput.value);
});

// Menambahkan resep baru
recipeForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("recipeName")
        .value.trim();

    const category = document.getElementById("recipeCategory")
        .value;

    const ingredientsText = document
        .getElementById("recipeIngredients")
        .value.trim();

    const stepsText = document
        .getElementById("recipeSteps")
        .value.trim();

    if (!name || !category || !ingredientsText || !stepsText) {
        formMessage.textContent =
            "Silakan lengkapi semua kolom.";
        return;
    }

    const newRecipe = {
        id: Date.now(),
        name: name,
        category: category,
        image: "",
        ingredients: ingredientsText
            .split(",")
            .map(item => item.trim())
            .filter(Boolean),
        steps: stepsText
            .split("\n")
            .map(item => item.trim())
            .filter(Boolean)
    };

    const previousRecipes = recipes;
    recipes = [newRecipe, ...recipes];

    if (!saveRecipes()) {
        recipes = previousRecipes;
        return;
    }

    recipeForm.reset();
    searchInput.value = "";
    displayRecipes();

    formMessage.textContent =
        "Resep berhasil ditambahkan dan disimpan!";

    document.getElementById("resep").scrollIntoView({
        behavior: "smooth"
    });
});

// Menampilkan resep saat halaman dibuka
displayRecipes();
