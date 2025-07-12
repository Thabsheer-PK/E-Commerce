var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  let products = [
    {
      name: "iPhone 11",
      category: "Mobile",
      description: "A powerful smartphone with A13 Bionic chip.",
      image: "/images/001.jpg"
    },
    {
      name: "Samsung Galaxy S22",
      category: "Mobile",
      description: "Latest Android flagship with stunning display.",
      image: "/images/002.jpg"
    },
    {
      name: "Sony WH-1000XM5",
      category: "Headphones",
      description: "Industry-leading noise cancellation headphones.",
      image: "/images/003.jpg"
    },
    {
      name: "MacBook Air M2",
      category: "Laptop",
      description: "Super fast, thin and light laptop with Apple Silicon.",
      image: "/images/004.jpg"
    },
    {
      name: "Dell XPS 13",
      category: "Laptop",
      description: "Compact and powerful Windows laptop.",
      image: "/images/005.jpg"
    },
    {
      name: "Canon EOS 1500D",
      category: "Camera",
      description: "Perfect DSLR camera for beginners.",
      image: "/images/006.jpg"
    },
    {
      name: "Logitech MX Master 3",
      category: "Accessories",
      description: "Ergonomic wireless mouse for productivity.",
      image: "/images/007.jpg"
    },
    {
      name: "Apple Watch Series 8",
      category: "Smartwatch",
      description: "Fitness and health tracking smartwatch.",
      image: "/images/008.jpg"
    },
    {
      name: "JBL Flip 6",
      category: "Speaker",
      description: "Portable Bluetooth speaker with deep bass.",
      image: "/images/009.jpg"
    },
    {
      name: "Amazon Echo Dot (5th Gen)",
      category: "Smart Home",
      description: "Smart speaker with Alexa voice assistant.",
      image: "/images/010.jpg"
    },
    {
      name: "HP LaserJet Printer",
      category: "Printer",
      description: "Fast and reliable laser printer for office needs.",
      image: "/images/011.jpg"
    },
    {
      name: "Fitbit Charge 5",
      category: "Fitness Band",
      description: "Track your workouts, heart rate, and sleep.",
      image: "/images/012.jpg"
    },
    {
      name: "Samsung 32\" Monitor",
      category: "Monitor",
      description: "Full HD display ideal for work and play.",
      image: "/images/013.jpg"
    },
    {
      name: "Anker Power Bank",
      category: "Power",
      description: "Fast-charging portable power bank with USB-C.",
      image: "/images/014.jpg"
    },
    {
      name: "TP-Link WiFi Router",
      category: "Networking",
      description: "Dual-band router for fast and stable internet.",
      image: "/images/015.jpg"
    }
  ];

  res.render('index', { products });
});

module.exports = router;
