
### PRODUCT ##############################
GET <BASE_URL>/api/v1/products
POST <BASE_URL>/api/v1/products
GET <BASE_URL>/v1/products/<ID_PRODUCT>
PATCH <BASE_URL>/api/v1/products/<ID_PRODUCT>
DELETE <BASE_URL>/api/v1/products/<ID_PRODUCT>

### STOCK ##############################
POST <BASE_URL>/api/v1/stock
GET <BASE_URL>/api/v1/stock/<ID_PRODUCT>
DELETE <BASE_URL>/api/v1/stock/<ID_VARIANT>/<ID_STOCK>
PATCH <BASE_URL>/api/v1/stock/<ID_STOCK>

### VARIANT ##############################
GET <BASE_URL>/api/v1/variant/<ID_VARIANT>
POST <BASE_URL>/api/v1/variant
DELETE <BASE_URL>/api/v1/variant/<ID_PRODUCT>/<ID_VARIANT>
PATCH <BASE_URL>/api/v1/variant/<ID_VARIANT>

### AUTH ##############################
POST <BASE_URL>/api/v1/user/login -> user
Content-Type: application/json
Accept: application/json

{
   "email": "adminkuyttt@gmail.com",
   "password": "admin312321321"
}


POST <BASE_URL>/api/v1/admin/login -> admin
Content-Type: application/json
Accept: application/json

{
   "email": "adminkuyttt@gmail.com",
   "password": "admin312321321"
}

POST <BASE_URL>/api/v1/admin/logout
POST <BASE_URL>/api/v1/user/logout

### USER ########################
GET <BASE_URL>/api/v1/users
DELETE <BASE_URL>/api/v1/users/<ID_USER>
POST <BASE_URL>/api/v1/user/create

### ARTIKEL KATEGORI ########################
POST <BASE_URL>/api/v1/categories
GET <BASE_URL>/api/v1/categories
PATCH <BASE_URL>/api/v1/categories/<ID_KATEGORI>
DELETE <BASE_URL>/api/v1/categories/<ID_KATEGORI>

### ARTIKEL ########################
GET <BASE_URL>/api/v1/posts
GET <BASE_URL>/api/v1/posts/<ID_ARTIKEL>
DELETE <BASE_URL>/api/v1/posts/<ID_ARTIKEL>

### ARTIKEL TAG ########################
GET <BASE_URL>/api/v1/tag
GET <BASE_URL>/api/v1/tag/<ID_TAG>
PATCH <BASE_URL>/api/v1/tag/<ID_TAG>
DELETE <BASE_URL>/api/v1/tag/<ID_TAG>

### WILAYAH ########################
GET <BASE_URL>/api/v1/provinces
GET <BASE_URL>/api/v1/regencies/<PROVINCES_CODE>
GET <BASE_URL>/api/v1/districts/<REGENCIES_CODE>
GET <BASE_URL>/api/v1/villages/<DISTRICTS_CODE>

### CART PRODUCT ########################
GET <BASE_URL>/api/v1/cart/<ID_USER>
POST <BASE_URL>/api/v1/cart
PATCH <BASE_URL>/api/v1/cart/<ID_CART>
DELETE <BASE_URL>/api/v1/cart/<ID_CART>

### ALAMAT ########################
GET <BASE_URL>/api/v1/addres/<ID_USER>
POST <BASE_URL>/api/v1/addres
PATCH <BASE_URL>/api/v1/addres/<ID_ALAMAT>
DELETE <BASE_URL>/api/v1/addres/<ID_ALAMAT>
PATCH <BASE_URL>/api/v1/addres/<ID_ALAMAT>/set-default

### Cek Ongkir ########################
POST <BASE_URL>/api/v1/shipping/check-ongkir
Accept: application/json
Content-Type: application/json

{
  "user_id": 28
}
