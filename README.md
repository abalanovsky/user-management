
# User Management App

Used in this project:

- Node.js
- express
- mongodb
- jsonwebtoken
- bcrypt
- dotenv


## Run

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```


* Note, that all database records is clear. 
You need to register admin, boss and regular users by yourself


* The user hierarchy starts with the administrator. 
That is, the boss of the first registered boss must be the administrator's nickname


## API Reference

### Register a User

Endpoint for user registration.

```http
POST /users/register
```

**Payload**

| Field      | Type   | Required    | Description                                           |
|:-----------|:-------|:------------|:------------------------------------------------------|
| `name`     | string | Yes         | User's name                                           |
| `password` | string | Yes         | User's password                                       |
| `role`     | string | Yes         | User's role                                           |
| `boss`     | string | Conditional | User's boss (Required if role is not 'administrator') |

**User roles**

- administrator (strictly one)
- regular
- boss - user automatically becomes a boss when the subordinate appears

*Example Request*

```http
POST /users/register
```


```
{
"name": "johnsmith",
"password": "password123",
"role": "employee",
"boss": "bossname"
}
````

*Example Response*:

{
"message": "Користувач зареєстрований"
}


### User Authentication

Endpoint for user authentication.


### User Authentication

Endpoint for user authentication.

```http
POST /users/authenticate
```

**Payload**

| Field      | Type   | Required | Description     |
|:-----------|:-------|:---------|:----------------|
| `name`     | string | Yes      | User's name     |
| `password` | string | Yes      | User's password |

*Example Request* 

```http
POST /users/authenticate
```

```
{
"name": "johnsmith",
"password": "password123"
}
```

*Example Response*:
```json
{
  "token": "<token>" 
}
```

### Get Users

Retrieve a list of users.

```http
GET /users
````

**Headers**

| Name            | Value        | Required | Description          |
|:----------------|:-------------|:---------|:---------------------|
| `Authorization` | Bearer Token | Yes      | Authentication token |

*Example Request*

```http
GET /users
```
```
Authorization: Bearer <token>
```

*Example Response*

```json
{
"users": [
    {
      "name": "johnsmith",
      "role": "employee",
      "boss": "bossname"
    },
    {
      "name": "janedoe",
      "role": "administrator"
    }
  ]
}
```

### Change User's Boss

Change the boss of a user (only accessible by a boss).

```http
PATCH /users/:userId/boss
```

**Headers**

| Name            | Value        | Required | Description          |
|:----------------|:-------------|:---------|:---------------------|
| `Authorization` | Bearer Token | Yes      | Authentication token |

**URL Parameters**

| Parameter | Type   | Required | Description              |
|:----------|:-------|:---------|:-------------------------|
| `userId`  | string | Yes      | ID of the user to update |

**Payload**

| Field     | Type   | Required | Description           |
|:----------|:-------|:---------|:----------------------|
| `newBoss` | string | Yes      | New boss for the user |

*Example Request*

```http
PATCH /users/123456/boss
```
Authorization: Bearer **<token>**


**body:**
```json 
{
  "newBoss": "newbossname"
}
```
*Example Response*

{
"message": "Боса користувача змінено успішно"
}



## Author

- [Artem Balanovskyi](https://www.linkedin.com/in/artem-balanovskyi-6547781a3) 

