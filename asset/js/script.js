document.addEventListener("DOMContentLoaded", function () {
    const addBookBtn = document.getElementById("addBookBtn");
    const bookTitleInput = document.getElementById("bookTitle");
    const authorInput = document.getElementById("author");
    const yearInput = document.getElementById("year");
    const bookStatusSelect = document.getElementById("bookStatus");
    const unfinishedList = document.getElementById("unfinishedList");
    const finishedList = document.getElementById("finishedList");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const searchResultsList = document.getElementById("searchResults");

    let unfinishedBooks = JSON.parse(localStorage.getItem("unfinishedBooks")) || [];
    let finishedBooks = JSON.parse(localStorage.getItem("finishedBooks")) || [];

    populateBookshelf(unfinishedList, unfinishedBooks, "unfinished");
    populateBookshelf(finishedList, finishedBooks, "finished");

    addBookBtn.addEventListener("click", function () {
        const title = bookTitleInput.value;
        const author = authorInput.value;
        const year = yearInput.value;
        const status = bookStatusSelect.value;

        if (title.trim() !== "") {
            const newBook = { title, author, year, status };
            addBook(newBook);
        }
    });

    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isDarkMode);
    });

    const isDarkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
    document.body.classList.toggle("dark-mode", isDarkMode);

    searchButton.addEventListener("click", function () {
        const query = searchInput.value;
        searchBooks(query, searchResultsList, [...unfinishedBooks, ...finishedBooks], "all");
    });

    searchInput.addEventListener("input", function () {
        const query = searchInput.value;
        searchBooks(query, searchResultsList, [...unfinishedBooks, ...finishedBooks], "all");
    });

    function moveBook(listElement, books, fromStatus, toStatus, index) {
        const movedBook = books.splice(index, 1)[0];
        movedBook.status = toStatus;
        if (toStatus === "unfinished") {
            unfinishedBooks.push(movedBook);
        } else if (toStatus === "finished") {
            finishedBooks.push(movedBook);
        }

        localStorage.setItem("unfinishedBooks", JSON.stringify(unfinishedBooks));
        localStorage.setItem("finishedBooks", JSON.stringify(finishedBooks));

        populateBookshelf(unfinishedList, unfinishedBooks, "unfinished");
        populateBookshelf(finishedList, finishedBooks, "finished");

        showNotification(`Book "${movedBook.title}" moved to ${toStatus === "unfinished" ? "Unfinished" : "Finished"}`);
    }

    function addBook(book) {
        if (book.status === "unfinished") {
            unfinishedBooks.push(book);
            populateBookshelf(unfinishedList, unfinishedBooks, "unfinished");
        } else if (book.status === "finished") {
            finishedBooks.push(book);
            populateBookshelf(finishedList, finishedBooks, "finished");
        }

        localStorage.setItem("unfinishedBooks", JSON.stringify(unfinishedBooks));
        localStorage.setItem("finishedBooks", JSON.stringify(finishedBooks));

        bookTitleInput.value = "";
        authorInput.value = "";
        yearInput.value = "";
        bookStatusSelect.value = "unfinished";

        showNotification(`Book "${book.title}" added to ${book.status === "unfinished" ? "Unfinished" : "Finished"}`);
    }

    function deleteBook(index, status) {
        let deletedBook;
        if (status === "unfinished") {
            deletedBook = unfinishedBooks[index];
            unfinishedBooks.splice(index, 1);
            populateBookshelf(unfinishedList, unfinishedBooks, "unfinished");
            localStorage.setItem("unfinishedBooks", JSON.stringify(unfinishedBooks));
        } else if (status === "finished") {
            deletedBook = finishedBooks[index];
            finishedBooks.splice(index, 1);
            populateBookshelf(finishedList, finishedBooks, "finished");
            localStorage.setItem("finishedBooks", JSON.stringify(finishedBooks));
        }

        showNotification(`Book "${deletedBook.title}" deleted from ${status === "unfinished" ? "Unfinished" : "Finished"}`);
    }

    function searchBooks(query, listElement, books, status) {
        const filteredBooks = books.filter(book => book.title.toLowerCase().includes(query.toLowerCase()));
        populateBookshelf(listElement, filteredBooks, status);
    }

    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("moveToUnfinished")) {
            const index = e.target.dataset.index;
            moveBook(finishedList, finishedBooks, "finished", "unfinished", index);
        } else if (e.target.classList.contains("moveToFinished")) {
            const index = e.target.dataset.index;
            moveBook(unfinishedList, unfinishedBooks, "unfinished", "finished", index);
        }
    });

    function showNotification(message) {
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(function () {
            notification.remove();
        }, 3000);
    }

    function createIconButton(iconClass, title, clickHandler) {
        const button = document.createElement("button");
        button.title = title;
        button.innerHTML = `<i class="${iconClass}"></i>`;
        button.addEventListener("click", clickHandler);
        return button;
    }

    function populateBookshelf(listElement, books, status) {
        listElement.innerHTML = "";
        books.forEach(function (book, index) {
            const listItem = document.createElement("li");
            listItem.className = "book";

            const bookInfo = document.createElement("div");
            bookInfo.className = "book-info";
            bookInfo.textContent = `${book.title} by ${book.author}, ${book.year}`;

            const deleteButton = createIconButton("fas fa-trash-alt", "Delete", function () {
                deleteBook(index, status);
            });

            const moveButton = createIconButton(
                status === "unfinished" ? "fas fa-check-circle" : "fas fa-undo",
                status === "unfinished" ? "Mark as Finished" : "Mark as Unfinished",
                function () {
                    const targetStatus = status === "unfinished" ? "finished" : "unfinished";
                    moveBook(listElement, books, status, targetStatus, index);
                }
            );

            listItem.appendChild(bookInfo);
            listItem.appendChild(moveButton);
            listItem.appendChild(deleteButton);
            listElement.appendChild(listItem);
        });
    }
});
