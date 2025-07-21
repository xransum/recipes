// ' " ®
$(async function() {
    function getData() {
        return new Promise(function(resolve, reject) {
            let control = $.ajax({
                method: "GET",
                url: "/recipes/full-list.json",
                dataType: "json",
            });

            control.done(function(data) {
                resolve(data);
            });
        });
    }

    function renderList(filteredData) {
        recipeList.empty();
        const fragment = $(document.createDocumentFragment());
        filteredData.forEach((recipe, r) => {
            fragment.append(
                $("<li>", { class: "recipe", index: r }).append(
                    $("<a>", {
                        href: recipe.url,
                        target: "_blank",
                        text: recipe.title
                    }),
                    $("<span>", { text: " - " }),
                    $("<kbd>", { class: "source", text: recipe.source || "Unknown Source" }),
                )
            );
        });
        recipeList.append(fragment);
    }

    function getRecipe(pathname) {
        return new Promise(function(resolve, reject) {
            let control = $.ajax({
                method: "GET",
                url: pathname,
                dataType: "json",
            });

            control.done(function(data) {
                resolve(data);
            });
        });
    }
    
    const recipeList = $('.recipes');
    // const data = (await getData()).slice(0, 100);
    const data = await getData();
    
    renderList(data);

    $(document.body).on("click", ".recipe a", async function(e) {
        e.preventDefault();

        var li = $(this);
        var index = parseInt(li.attr("index"));

        var pathname = li.attr("href");
        var recipe = await getRecipe(`${ pathname }.json`);
        if (!recipe) {
            console.error("Recipe not found:", pathname);
            return;
        }

        var dialog = $('.recipe-dialog');
        if (dialog.length) {
            dialog.remove();
        }

        dialog = $('<div>', {
            class: 'recipe-dialog'
        }).dialog({
            title: recipe.title,
            modal: true,
            width: "50%",
            height: "auto",
            // position the dialog at the top center of the screen
            position: { my: "top", at: "top+50", of: window },
            close: function() {
                $(this).dialog("destroy");
            },
            buttons: [],
        });

        console.log(recipe);

        dialog.append([
            // Source Section
            $('<div>', { class: "source-section" }).append([
                $('<div>', { class: "left-section" }).append([
                    $('<span>', { class: "source-name", text: recipe.source })
                ]),
                $('<div>', { class: "right-section" }).append([
                    $('<a>', { class: "source-link", text: "View Source", href: recipe.sourceUrl, target: "_blank" })
                ]),
            ]),

            // Ingredients Section
            $('<fieldset>', { class: "ingredients" }).append([
                $("<legend>").text("Ingredients"),
                $("<ul>").append(recipe.ingredients.map(ingredient => {
                    const id = ingredient.match(/\w+/g).join("-").toLowerCase();
                    return $("<li>").append([
                        $('<input>', { type: "checkbox", class: "ingredient-checkbox", id: id }),
                        $('<label>', { for: id }).text(ingredient),
                    ]);
                })),
            ]),

            // Directions Section
            $('<fieldset>', { class: "directions" }).append([
                $("<legend>").text("Directions"),
                $("<ol>", { class: "directions" }).append(recipe.directions.map(step => {
                    const id = step.match(/\w+/g).join("-").toLowerCase();
                    return $("<li>", { class: 'step' }).append([
                        $('<input>', { type: "checkbox", class: "step-checkbox", id: id }),
                        $('<label>', { for: id }).text(step),
                    ]);
                })),
            ]),
        ]);
    });
    
    $("input#search").on("keyup", function(e) {
        if (e.key == "Enter") {
            let term = this.value.toLowerCase();
            let filtered = data.filter(r => r.title.toLowerCase().includes(term));
            renderList(filtered);
        }
    });
});