var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  let products = [
  {
    name: "iPhone 11",
    category: "Mobile",
    description: "A powerful smartphone with A13 Bionic chip.",
    image: "/images/001.jpg",
    price: 44999
  },
  {
    name: "Samsung Galaxy S22",
    category: "Mobile",
    description: "Latest Android flagship with stunning display.",
    image: "/images/002.jpg",
    price: 59999
  },
  {
    name: "Sony WH-1000XM5",
    category: "Headphones",
    description: "Industry-leading noise cancellation headphones.",
    image: "/images/003.jpg",
    price: 29999
  },
  {
    name: "MacBook Air M2",
    category: "Laptop",
    description: "Super fast, thin and light laptop with Apple Silicon.",
    image: "/images/004.jpg",
    price: 99999
  },
  {
    name: "Dell XPS 13",
    category: "Laptop",
    description: "Compact and powerful Windows laptop.",
    image: "/images/005.jpg",
    price: 87999
  },
  {
    name: "Canon EOS 1500D",
    category: "Camera",
    description: "Perfect DSLR camera for beginners.",
    image: "/images/006.jpg",
    price: 35999
  },
  {
    name: "Logitech MX Master 3",
    category: "Accessories",
    description: "Ergonomic wireless mouse for productivity.",
    image: "/images/007.jpg",
    price: 7499
  },
  {
    name: "Apple Watch Series 8",
    category: "Smartwatch",
    description: "Fitness and health tracking smartwatch.",
    image: "/images/008.jpg",
    price: 41999
  },
  {
    name: "JBL Flip 6",
    category: "Speaker",
    description: "Portable Bluetooth speaker with deep bass.",
    image: "/images/009.jpg",
    price: 9499
  },
  {
    name: "Amazon Echo Dot (5th Gen)",
    category: "Smart Home",
    description: "Smart speaker with Alexa voice assistant.",
    image: "/images/010.jpg",
    price: 4499
  },
  {
    name: "HP LaserJet Printer",
    category: "Printer",
    description: "Fast and reliable laser printer for office needs.",
    image: "/images/011.jpg",
    price: 12999
  },
  {
    name: "Fitbit Charge 5",
    category: "Fitness Band",
    description: "Track your workouts, heart rate, and sleep.",
    image: "/images/012.jpg",
    price: 10999
  },
  {
    name: "Samsung 32\" Monitor",
    category: "Monitor",
    description: "Full HD display ideal for work and play.",
    image: "/images/013.jpg",
    price: 15999
  },
  {
    name: "Anker Power Bank",
    category: "Power",
    description: "Fast-charging portable power bank with USB-C.",
    image: "/images/014.jpg",
    price: 2499
  },
  {
    name: "TP-Link WiFi Router",
    category: "Networking",
    description: "Dual-band router for fast and stable internet.",
    image: "/images/015.jpg",
    price: 1899
  }
];

  res.render('admin/view-products',{admin:true,products})
});

router.get('/add-product',(req,res)=>{
  res.render('admin/add-product-form')
})

router.post('/add-product',(req,res)=>{
  console.log(req.body);
 console.log(req.files.Image);
  res.send('Product received');
})

module.exports = router;
