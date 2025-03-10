import { useEffect, useState } from "react";

import "./index.css";

function FirstDraft() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState(0);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/books/");
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.log(err);
    }
  };

  const addBook = async () => {
    const bookData = {
      title,
      release_year: releaseYear,
    };
    try {
      const response = await fetch("http://127.0.0.1:8000/api/books/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      setBooks((prev) => [...prev, data]);
    } catch (err) {
      console.log(err);
    }
  };

  const updateTitle = async (pk, release_year) => {
    const bookData = {
      title: newTitle,
      release_year,
    };
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/books/${pk}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      setBooks((prev) =>
        prev.map((book) => {
          if (book.id === pk) {
            return data;
          } else {
            return book;
          }
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  const deleteBook = async (pk) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/books/${pk}`, {
        method: "DELETE",
      });

      setBooks((prev) => prev.filter((book) => book.id !== pk));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div>
        <h1>test title</h1>
        <input
          type="text"
          placeholder="test box"
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="test box 2"
          onChange={(e) => setReleaseYear(e.target.value)}
        />
        <button onClick={addBook}>test add record</button>
      </div>
      {books.map((book) => (
        <div>
          {" "}
          <p>Title: {book.title}</p>
          <p>Release Year: {book.release_year} </p>
          <input
            type="text"
            placeholder="new title"
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button onClick={() => updateTitle(book.id, book.release_year)}>
            change title
          </button>
          <button onClick={() => deleteBook(book.id)}>Delete title</button>
        </div>
      ))}
    </>
  );
}

export default FirstDraft;
