<template>
  <main>
    <h2>Ürün Ekle</h2>
    <form @submit.prevent="addProductToList">
      <div class="form-inner">
        <div>
          <label for="title">Ürün Adı:</label>
          <input id="title" type="text" v-model="newProduct.title" placeholder="Ürün Adı" />
        </div>
        <div>
          <label for="description">Açıklama:</label>
          <textarea id="description" v-model="newProduct.description" placeholder="Ürün Açıklaması"></textarea>
        </div>
        <div>
          <label for="price">Fiyat:</label>
          <input id="price" v-model.number="newProduct.price" type="number" placeholder="Ürün Fiyatı" />
        </div>
        <div>
          <label for="stock">Stok:</label>
          <input id="stock" v-model.number="newProduct.stock" type="number" placeholder="Stok Adedi" />
        </div>
        <div>
          <label for="image">Resim:</label>
          <input id="image" type="file" @change="onFileChange" ref="fileInput" accept="image/*" />
        </div>
        <button type="submit">Ekle</button>
      </div>
    </form>
  </main>
  <header>
    <h1>Ürünler</h1>
    <div>
      <div class="product-grid">
        <li v-for="product in products" :key="product._id">
          <div class="product-card">
            <img class="product-image" :src="`https://kaanucak.online${product.imageUrl}`" alt="product image" width="100" />
            <div class="product-details">
              <div class="product-name"> {{ product.title }} </div>
              <div class="product-description"> {{ product.description }} </div>
              <div class="product-price">Fiyat: {{ product.price }} ₺ </div>
              <div class="product-stock">{{ product.stock }} Ürün kaldı. </div>
            </div>
            <div class="action-buttons">
              <button class="delete delete-button" @click="deleteProductFromList(product._id)">Sil</button> <!-- buradaki parametre '''gönderilen''' -->
              <button class="update-button" @click="openUpdatePopup(product)">Güncelle</button>
            </div>
          </div>
        </li>
      </div>
    </div>

    <div v-if="showPopup" class="popup">
      <h2>Ürünü Güncelle</h2>
      <div>
        <label for="updateTitle">Ürün Adı:</label>
        <input id="updateTitle" v-model="updatedProduct.title" placeholder="Yeni Başlık" />
      </div>
      <div>
        <label for="updateDescription">Açıklama:</label>
        <textarea id="updateDescription" v-model="updatedProduct.description" placeholder="Yeni Açıklama"></textarea>
      </div>
      <div>
        <label for="updatePrice">Fiyat:</label>
        <input id="updatePrice" v-model.number="updatedProduct.price" type="number" placeholder="Yeni Fiyat" />
      </div>
      <div>
        <label for="updateStock">Stok:</label>
        <input id="updateStock" v-model.number="updatedProduct.stock" type="number" placeholder="Yeni Stok Adedi" />
      </div>
      <div>
        <label for="updateImage">Resim:</label>
        <input id="updateImage" type="file" @change="onUpdateFileChange" ref="updateFileInput" accept="image/*" />
      </div>
      <button @click="saveUpdatedProduct">Kaydet</button>
      <button @click="closeUpdatePopup">İptal</button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProducts, addProduct, deleteProduct, updateProduct as apiUpdateProduct } from './services/api';

const products = ref([]);
const newProduct = ref({ title: '', description: '', price: 0, stock: 0, image: null });
const error = ref('');

const fileInput = ref(null);
const updateFileInput = ref(null);

const showPopup = ref(false);
const updatedProduct = ref({ title: '', description: '', price: 0, stock: 0, image: null });
const currentProduct = ref(null);

const fetchProducts = async () => {
  try {
    products.value = await getProducts();
  } catch (err) {
    error.value = 'Ürünleri getirme başarısız';
    console.error(err);
  }
};

const onFileChange = (e) => {
  newProduct.value.image = e.target.files[0];
  console.log(e.target.files[0])
};

const addProductToList = async () => {
  try {
    const addedProduct = await addProduct(newProduct.value); /* API çağrısı başlatıldı, addProduct() fonksiyonu çağrıldı ve newProduct.value nesnesi parametre olarak addProduct() fonksiyonuna iletiliyor ve addProduct fonksiyonunun ---dönüş değerini--- addedProduct değişkenine atıyor.. yani await parametreyi gönderip addProduct fonksiyonunun dönüş değerini bekliyor.(bu dönüş değerine * Promise * denir...) --- Bir başka deyişle: await addProduct(newProduct.value) ifadesi, addProduct fonksiyonunun çalışmasını bekler. Bu fonksiyonun döndürdüğü Promise çözülene kadar bekler ve sonuç değeri addedProduct değişkenine atanır. */

    /* await İfadesi */
    /* await, addProduct fonksiyonunun çalışmasını beklerken kodun bu satırda duraklamasını sağlar. addProduct fonksiyonu bir Promise döner ve bu Promise çözüldüğünde (başarılı veya başarısız şekilde tamamlandığında), await ifadesi bu değeri döndürür. Eğer Promise reddedilirse (hata oluşursa), await ifadesi bir hata fırlatır ve bu hata catch bloğunda yakalanır. */
    
    products.value.push(addedProduct);                      /* ürün başarıyla eklendiğinde ürün listesine ekleme */
    newProduct.value = { title: '', description: '', price: 0, stock: 0, image: null }; /* form temizleme */
    fileInput.value.value = null; // Dosya inputunu sıfırlama
  } catch (err) {
    error.value = 'Ürün ekleme başarısız';
    console.error(err);
  }
};


const deleteProductFromList = async (id) => { /* buradaki parametre '''alınan''' */
  try {
    await deleteProduct(id); /* buradaki parametre '''gönderilen''' */
    products.value = products.value.filter(product => product._id !== id);
  } catch (err) {
    error.value = 'Ürün silme başarısız';
    console.error(err);
  }
};

const openUpdatePopup = (product) => {
  currentProduct.value = product;
  updatedProduct.value = { ...product };
  showPopup.value = true;
};

const closeUpdatePopup = () => {
  showPopup.value = false;
  currentProduct.value = null;
  updatedProduct.value = { title: '', description: '', price: 0, stock: 0, image: null };
  updateFileInput.value.value = null; // Güncelleme dosya inputunu sıfırlama
};

const onUpdateFileChange = (e) => {
  updatedProduct.value.image = e.target.files[0];
};

const saveUpdatedProduct = async () => {
  try {
    const updatedProductData = await apiUpdateProduct(currentProduct.value._id, updatedProduct.value);
    const index = products.value.findIndex(product => product._id === currentProduct.value._id);
    products.value[index] = updatedProductData;
    closeUpdatePopup();
  } catch (err) {
    error.value = 'Ürün güncelleme başarısız';
    console.error(err);
  }
};

onMounted(fetchProducts);

/* ÖNEMLİ NOT:
Gönderilen ve Alınan Parametrelerin Karşılaştırılması

Kodunuzda aşağıdaki kriterlerle parametrelerin gönderilen veya alınan olduğunu kolayca anlayabilirsiniz:

	•	Gönderilen Parametreler: Fonksiyon 'çağrısı' sırasında parantez içinde belirtilir. Örneğin, functionName(parametre) şeklinde.
	•	Alınan Parametreler: Fonksiyon 'tanımında' parantez içinde yer alır. Örneğin, const functionName = (parametre) => { ... }.

Bu şekilde, parametrelerin gönderilip gönderilmediğini ya da alınıp alınmadığını kolayca anlayabilirsiniz.
*/

console.log(products.value)
</script>

