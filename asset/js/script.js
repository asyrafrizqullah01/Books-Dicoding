document.addEventListener('DOMContentLoaded', function () {
  const bookForm = document.getElementById('bookForm');
  const searchForm = document.getElementById('searchForm');
  const unreadBooksContainer = document.getElementById('unreadBooks');
  const readBooksContainer = document.getElementById('readBooks');
  const searchInput = document.getElementById('search');

  let unreadBooks = JSON.parse(localStorage.getItem('unreadBooks')) || [];
  let readBooks = JSON.parse(localStorage.getItem('readBooks')) || [];

  loadBooks(unreadBooks, unreadBooksContainer);
  loadBooks(readBooks, readBooksContainer);

  bookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBooks();
  });

  // Menangani event input untuk pencarian
  searchInput.addEventListener('input', function () {
    searchBooks();
  });

  function addBook() {
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const yearInput = document.getElementById('year');
    const isReadCheckbox = document.getElementById('isRead');

    const title = titleInput.value;
    const author = authorInput.value;
    const year = yearInput.value;
    const isRead = isReadCheckbox.checked;

    if (title && author && year) {
      const book = createBookElement(title, author, year, isRead);

      if (isRead) {
        readBooksContainer.appendChild(book);
        readBooks.push({ title, author, year });
        localStorage.setItem('readBooks', JSON.stringify(readBooks));
      } else {
        unreadBooksContainer.appendChild(book);
        unreadBooks.push({ title, author, year });
        localStorage.setItem('unreadBooks', JSON.stringify(unreadBooks));
      }

      titleInput.value = '';
      authorInput.value = '';
      yearInput.value = '';
      isReadCheckbox.checked = false;

      animateBook(book);
      showNotification(`Book "${title}" added successfully!`);
    }
  }

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(function () {
      notification.style.opacity = '0';
      setTimeout(function () {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }

  function loadBooks(books, container) {
    books.forEach(function (book) {
      const bookElement = createBookElement(book.title, book.author, book.year, book.isRead);
      container.appendChild(bookElement);
    });
  }

  function animateBook(book) {
    book.style.opacity = '0';
    setTimeout(function () {
      book.style.transition = 'opacity 0.5s ease-in-out';
      book.style.opacity = '1';
    }, 0);
  }

  function createBookElement(title, author, year, isRead) {
    const bookDiv = document.createElement('div');
    bookDiv.classList.add('book');
    bookDiv.style.opacity = '1';

    const bookInfo = document.createElement('div');
    bookInfo.classList.add('book-info');
    bookInfo.innerHTML = `<strong>${title}</strong> by ${author}, ${year}`;

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn');
    deleteButton.innerHTML = '<i class="bx bx-trash-alt"></i>';
    deleteButton.addEventListener('click', function () {
      bookDiv.parentNode.removeChild(bookDiv);
      removeBookFromStorage(title, isRead);
      showNotification(`Book "${title}" deleted successfully!`);
    });

    const toggleReadButton = document.createElement('button');
    toggleReadButton.classList.add('toggle-read-btn');
    toggleReadButton.innerHTML = isRead ? '<i class="bx bx-arrow-back"></i>' : '<i class="bx bx-check"></i>';
    toggleReadButton.title = isRead ? 'Mark as read' : 'Mark as unRead';
    toggleReadButton.addEventListener('click', function () {
      if (isRead) {
        readBooksContainer.appendChild(bookDiv);
        toggleReadButton.innerHTML = '<i class="bx bx-arrow-back"></i>';
        toggleReadButton.title = 'Mark as read';
        moveBookBetweenStorage(title, isRead, false);
        showNotification(`Book "${title}" marked as Read`);
      } else {
        unreadBooksContainer.appendChild(bookDiv);
        toggleReadButton.innerHTML = '<i class="bx bx-check"></i>';
        toggleReadButton.title = 'Mark as unRead';
        moveBookBetweenStorage(title, isRead, true);
        showNotification(`Book "${title}" marked as unRead`);
      }
      isRead = !isRead;
    });

    bookDiv.appendChild(bookInfo);
    bookDiv.appendChild(deleteButton);
    bookDiv.appendChild(toggleReadButton);

    return bookDiv;
  }

  function removeBookFromStorage(title, isRead) {
    if (isRead) {
      readBooks = readBooks.filter(book => book.title !== title);
      localStorage.setItem('readBooks', JSON.stringify(readBooks));
    } else {
      unreadBooks = unreadBooks.filter(book => book.title !== title);
      localStorage.setItem('unreadBooks', JSON.stringify(unreadBooks));
    }
  }

  function moveBookBetweenStorage(title, fromRead, toRead) {
    const sourceBooks = fromRead ? readBooks : unreadBooks;
    const destinationBooks = toRead ? readBooks : unreadBooks;

    const movedBook = sourceBooks.find(book => book.title === title);
    sourceBooks.splice(sourceBooks.indexOf(movedBook), 1);
    destinationBooks.push(movedBook);

    localStorage.setItem('readBooks', JSON.stringify(readBooks));
    localStorage.setItem('unreadBooks', JSON.stringify(unreadBooks));
  }
});
