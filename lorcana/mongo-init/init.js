// This script initializes the MongoDB database with starter data
// when the container is first created

// Switch to lorcana database
db = db.getSiblingDB('lorcana');

// Create a user for the database
db.createUser({
  user: 'lorcanauser',
  pwd: 'lorcanapass',
  roles: [
    {
      role: 'readWrite',
      db: 'lorcana',
    },
  ],
});

// Insert sample cards if collection is empty
if (db.Cards.countDocuments() === 0) {
  db.Cards.insertMany([
    {
      Name: "Ariel - Spirited Singer",
      Set_Num: "1",
      Rarity: "Rare",
      Color: "Amethyst",
      Price: 4.99,
      Image: "https://via.placeholder.com/150?text=Ariel"
    },
    {
      Name: "Mickey Mouse - Brave Little Tailor",
      Set_Num: "1",
      Rarity: "Legendary",
      Color: "Sapphire",
      Price: 24.99,
      Image: "https://via.placeholder.com/150?text=Mickey"
    },
    {
      Name: "Elsa - Snow Queen",
      Set_Num: "1",
      Rarity: "Super Rare",
      Color: "Ruby",
      Price: 9.99,
      Image: "https://via.placeholder.com/150?text=Elsa"
    },
    {
      Name: "Goofy - Royal Guard",
      Set_Num: "2",
      Rarity: "Common",
      Color: "Steel",
      Price: 0.99,
      Image: "https://via.placeholder.com/150?text=Goofy"
    },
    {
      Name: "Belle - Inventive Engineer",
      Set_Num: "2",
      Rarity: "Uncommon",
      Color: "Emerald",
      Price: 1.99,
      Image: "https://via.placeholder.com/150?text=Belle"
    }
  ]);
  
  print("Sample cards added to database");
}

// Initialize pricing settings if not exists
if (db.PricingSettings.countDocuments() === 0) {
  db.PricingSettings.insertOne({
    premiumPackPrice: 19.99,
    shippingPrices: {
      "GTA": 5.99,
      "Southern Ontario": 7.99,
      "Northern Ontario": 9.99,
      "Canada Wide": 12.99,
      "International": 24.99
    },
    rarityPrices: {
      "Common": 0.99,
      "Uncommon": 1.99,
      "Rare": 4.99,
      "Super Rare": 9.99,
      "Legendary": 24.99
    },
    lastUpdated: new Date()
  });
  
  print("Pricing settings added to database");
}

print("Database initialization completed!");