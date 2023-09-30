process.env.NODE_ENV = "test"

const request = require("supertest");


const app = require("../app");
const db = require("../db");

//isbn sample book 

let bookIsbn;

beforeEach(async () => { 
    let result = await db. query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '123432124',
        'https://amazon.com/taco',
        'Elie',
        'English',
        100,
        'Nothing publishers',
        'my first book', 2008)
      RETURNING isbn`);

      bookIsbn = result.rows[0].isbn
});

describe("POST / books ",()=>{
    test("Makes new book", async()=>{
        const resp = await request(app)
        .post(`/books`)
        .send({
            isbn: '32794782',
          amazon_url: "https://taco.com",
          author: "mctest",
          language: "english",
          pages: 1000,
          publisher: "yeah right",
          title: "amazing times",
          year: 2000
        });
        expect(resp.statusCode).toBe(201);
        expect(resp.body.book).toHaveProperty("isbn")
    });

    test("Stops creation of book with required title", async()=>{
        const resp = await request(app)
        .post(`/books`)
        .send({year: 2000});
        expect(resp.statusCode).toBe(400);
    });
});

describe("PUT /books/:id", ()=> {
    test("updates single book", async ()=> {
        const resp = await request(app)
        .put(`/books/${bookIsbn}`)
        .send({
            amazon_url: "https://taco.com",
          author: "mctest",
          language: "english",
          pages: 1000,
          publisher: "yeah right",
          title: "UPDATED BOOK",
          year: 2000

        });
        expect(resp.body.book).toHaveProperty("isbn");
        expect(resp.body.book.author).toBe("mctest");
    });

    test("stops bad update", async()=>{
        const resp = await request(app)
        .put(`/books/${bookIsbn}`)
        .send({
            isbn: "32794782",
            badField: "DO NOT ADD ME!",
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "UPDATED BOOK",
            year: 2000
        });
        expect(resp.statusCode).toBe(400);
    });

    test("Responds with 404 if book is not found", async()=>{
        //deletes book for 404
        await request(app)
        .delete(`/books/${bookIsbn}`) 
        const resp = await request(app).delete(`/books/${bookIsbn}`);
        expect(resp.statusCode).toBe(404);
    });
});

describe("DELETE /books/:id", ()=>{
    test("Deletes single book", async()=>{
        const resp = await request(app)
        .delete(`/books/${bookIsbn}`)
        expect(resp.body).toEqual({message: "Book deleted"});
    });
});

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });

afterAll(async function () {
    await db.end()
  });