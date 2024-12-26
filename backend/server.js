const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const port = 3000;

const corsOptions = {
    origin: 'http://13.60.29.149',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Frontend uygulamasını sun
app.use(express.static(path.join(__dirname, "../dist")));

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Geçici olarak orijinal uzantıyı kullan
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
const atlasURI = 'mongodb+srv://abdullahucaak:araspeace123@exampledatabase.jathgnd.mongodb.net/?retryWrites=true&w=majority&appName=ExampleDatabase'
// MongoDB bağlantısı
const mongoURI = atlasURI;
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => console.log('MongoDB bağlantısı hatası: ', err));

// Ürün Şeması ve Modeli
const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    imageUrl: { type: String, required: true }
});

// Şema Modeli Tanımı - Product burada model oluyor.
const Product = mongoose.model('Product', ProductSchema); /* üçüncü parametre 'Product' model isminden otomatik türenen 'products'tır. collection ismidir... */

//Frontend uygulamasını sun
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
//Frontend uygulamasını sun

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, stock } = req.body;
        const originalPath = req.file.path;
        const webpFilename = req.file.filename.replace(path.extname(req.file.filename), '.webp');
        const outputPath = path.join(__dirname, 'uploads', webpFilename);
        
        // Resmi .webp formatına dönüştür
        await sharp(originalPath)
            .webp({ quality: 80 })
            .toFile(outputPath);

        // Orijinal dosyayı sil
        fs.unlink(originalPath, (err) => {
            if (err) console.error('Orijinal dosya silinirken hata:', err);
        });

        const imageUrl = `/uploads/${webpFilename}`;
        const newProduct = new Product({ title, description, price, stock, imageUrl });
        await newProduct.save();
        res.json(newProduct);
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).send(err.message);
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).send('Product not found');

        // Resim dosyasını silme
        const imagePath = path.join(__dirname, product.imageUrl); /* path.join(__dirname, product.imageUrl), ürünün resim dosyasının tam yolunu oluşturur.__dirname, şu anki dosyanın bulunduğu dizinin yolunu temsil eder. product.imageUrl, veritabanında saklanan resim dosyasının yoludur. */
        fs.unlink(imagePath, (err) => { /* fs.unlink fonksiyonu, belirtilen dosya yolunu kullanarak dosyayı siler. imagePath, silinecek dosyanın yolunu belirtir. İkinci parametre olarak bir geri çağırma fonksiyonu (callback) alır, bu fonksiyon dosya silme işlemi tamamlandığında çağrılır.       */
            if (err) {
                console.error('Resim dosyası silinirken hata oluştu:', err);
            } else {
                console.log('Resim dosyası başarıyla silindi');
            }
        });

        res.json(product); /* Silinen ürün bilgilerini JSON formatında yanıt olarak döner. Neden JSON formatında yanıt döndürür, sorusunu GPT'ye sorabilirsin. */
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/products/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, stock } = req.body;
        const updateData = { title, description, price, stock };

        if (req.file) {
            const product = await Product.findById(req.params.id);
            if (product) {
                const oldImagePath = path.join(__dirname, product.imageUrl);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Eski resim dosyası silinirken hata oluştu:', err);
                    }
                });
            }

            const originalPath = req.file.path;
            const webpFilename = req.file.filename.replace(path.extname(req.file.filename), '.webp');
            const outputPath = path.join(__dirname, 'uploads', webpFilename);
            
            // Resmi .webp formatına dönüştür
            await sharp(originalPath)
                .webp({ quality: 80 })
                .toFile(outputPath);

            // Orijinal dosyayı sil
            fs.unlink(originalPath, (err) => {
                if (err) console.error('Orijinal dosya silinirken hata:', err);
            });

            updateData.imageUrl = `/uploads/${webpFilename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedProduct) return res.status(404).send('Ürün bulunamadı');
        res.json(updatedProduct);
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).send(err.message);
    }
});


app.listen(port, () => {
    console.log(`Server ${port} numaralı portta çalışıyor`);
});
