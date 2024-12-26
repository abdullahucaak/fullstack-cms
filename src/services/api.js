import axios from 'axios';

const API_URL = 'https://kaanucak.online'; /* Caddy 3000 port olayları halledildi ve buradan ve App dosyası 36. satırdan 3000 port olayı kaldırıldı. */

export const getProducts = async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
};

export const addProduct = async (product) => {
    // 1. Yeni bir FormData örneği oluşturulur.
    const formData = new FormData();                /* FormData, JavaScript'te tarayıcı API'sinde bulunan bir classtır. Genellikle form verilerini kolayca oluşturmak ve göndermek için kullanılır. Özellikle dosya yüklemeleri gibi, karmaşık form verilerinin yönetiminde oldukça kullanışlıdır. */
                                                    /* new ifadesi, JavaScript'te bir class'tan yeni bir örnek (instance) oluşturmak için kullanılır. Bu durumda, new FormData() ifadesi yeni bir FormData örneği oluşturur. */
    // 2. FormData'ya ürün bilgileri eklenir.
    formData.append('title', product.title); /* formData.append() metodu, FormData nesnesine yeni bir anahtar-değer çifti ekler. Bu yöntem, form verilerini bir araya getirmek için kullanılır. ilk parametre: key, ikinci parametre: value */
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('stock', product.stock);
    formData.append('image', product.image);
    
    // 3. Axios ile POST isteği yapılır.
    const response = await axios.post(`${API_URL}/products`, formData, { /* 1) URL (1. Parametre): İsteğin yapılacağı adres. 2) Veri (2. Parametre): Gönderilecek veriler (bu örnekte formData). 3) Seçenekler (3. Parametre): İstek için ek seçenekler ve başlıklar (headers). */
        headers: {                                                      /* headers Nedir? headers, HTTP isteği yapılırken kullanılan başlıkları belirlemek için kullanılır. Bu başlıklar, sunucuya istek hakkında ek bilgiler verir. */
            'Content-Type': 'multipart/form-data'                       /* Content-Type başlığı, gönderilen verinin türünü belirtir. Sunucu, bu başlık sayesinde gönderilen veriyi nasıl işleyeceğini anlar multipart/form-data, form verilerinin özellikle dosya yüklemeleri gibi, farklı türde verilerin bir arada gönderildiği durumlar için kullanılan bir Content-Type türüdür. Form verilerinin parçalara ayrılarak gönderilmesini sağlar. */
        }
    });

    // 4. Sunucudan dönen yanıt verisi geri döndürülür.
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await axios.delete(`${API_URL}/products/${id}`);
    return response.data;
};

export const updateProduct = async (id, product) => {
    const formData = new FormData();
    formData.append('title', product.title);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('stock', product.stock);
    if (product.image) {
        formData.append('image', product.image);
    }
    
    const response = await axios.put(`${API_URL}/products/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
