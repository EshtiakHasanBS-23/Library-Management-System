from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to Library Management System!"}

@app.get("/books")
def get_books():
    return {"books": ["Book A", "Book B", "Book C"]}
