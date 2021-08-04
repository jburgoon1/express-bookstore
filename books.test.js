process.env.NODE_ENV = "test"

const request = require("supertest");


const app = require("./app");
const db = require("./db");

beforeEach(async () => {
    let result = await db.query(`
      INSERT INTO 
        books (isbn, amazon_url,author,language,pages,publisher,title,year)   
        VALUES(
          '123432122', 
          'https://amazon.com/taco', 
          'Elie', 
          'English', 
          100,  
          'Nothing publishers', 
          'my first book', 2008) 
        RETURNING isbn`);
  
    book_isbn = result.rows[0].isbn
  });

  describe('Create a book', () =>{
      test('creates a new book', async () =>{
        const result = await request(app)
        .post('/books/')
        .send(
            {
                isbn: '123456789',
                amazon_url: 'https://amazon.com/cool',
                author: 'justin',
                language: 'english',
                pages: 20000000,
                publisher: 'dusty',
                title: 'this is cool',
                year: 2023
            }
        )
        expect(result.statusCode).toBe(201)
        expect(result.body.book).toHaveProperty("isbn")
      })

      test('not all required fields', async () =>{
          const result = await request(app)
          .post('/books/')
          .send(
              {
                  author:'justin'
              }
          )
          expect(result.statusCode).toBe(400)

      })
  })

  describe('get books', () =>{
      test('GET /', async () =>{
        const result = await request(app)
        .get('/books/')
        expect(result.statusCode).toBe(200)
        expect(result.body.books[0]).toHaveProperty('isbn')
      })
      test('GET /:id', async ()  =>{
          const result = await request(app)
          .get('/books/123432122')
          expect(result.statusCode).toBe(200)
          expect(result.body.book).toHaveProperty('isbn')
      })
  })

  describe('update book', () =>{
      test('PUT /:isbn', async () =>{
        const result = await request(app)
        .put('/books/123432122')
        .send(
            {
                isbn: '123432122', 
                amazon_url: 'https://amazon.com/taco',
                author: 'Elie',
                language: 'English', 
                pages: 100,
                publisher: 'Nothing publishers',
                title: 'my second book',
                year: 2008
            }
        )
        expect(result.statusCode).toBe(200)
        expect(result.body.book).toHaveProperty('isbn')
      })
      test('PUT /:isbn not all required fields', async () =>{
        const result = await request(app)
        .put('/books/123432122')
        .send(
            {
                isbn: '123432122', 
                amazon_url: 'https://amazon.com/taco',
                author: 'Elie', 
                pages: 100,
                publisher: 'Nothing publishers',
                title: 'my second book',
                year: 2008
            }
        )
        expect(result.statusCode).toBe(400)
      })
  })

  describe('delete books', () =>{
      test('DELETE /:isbn', async () =>{
          const result = await request(app)
          .delete('/books/123432122')
          expect(result.body.message).toBe("Book deleted")
      })
  })

  afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  
  afterAll(async function () {
    await db.end()
  });
