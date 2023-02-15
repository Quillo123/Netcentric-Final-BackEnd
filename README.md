# Netcentric-Final-BackEnd

A Simple Library Website backend created using node and mongoDB

***

## To Insert a book

### url.com/api/books/
---
	title=[string]&
	description=[string]&
	price=[number]&
	year=[number]&
	hardcover=[bool]&
	authors[0]['name']=[string]&
	authors[0]['nationality']=[string]&
	authors[1]['name']=[string]&
	authors[1]['nationality']=[string]&

Authors must start from 0 and must not skip numbers. You May add as many as needed, just keep increasing the number.
***
## To Insert a new Author
### url.com/api/authors/
---
	name=[string]&
	nationality=[string]&
	
