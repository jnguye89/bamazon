var mysql = require ('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root", 
	password: "", 
	database: "bamazon",
});

connection.connect(function(err){
	if (err) throw err;

	// console.log("connected as id " + connection.threadId);

	displayItemsAvailable();
	// startAgain();
});


//asks whether the user wants to make another purchase or not
var startAgain = function(){
	inquirer.prompt([
		{
			type: "confirm", 
			name: "continue", 
			message: "Would you like to make another purchase?"
		}
	]).then(function(response){
		if (response.continue){
			choseItem();
		} else {
			connection.end();
		}
	}
	)
}

//displays all items available for sale, and all associated information
var displayItemsAvailable = function(){
	var query = connection.query(
		"SELECT * FROM products", 
		function(err, res){
			if (err) throw err;
			res.forEach(function(value){
				console.log("Item ID: " + value.item_id + "\nProduct name: " + value.product_name + "\nDepartment: " + value.department_name + "\nPrice: $" + value.price + "\n");
			});
			choseItem();
		}
	);
	
};

//propts use to chose their item and passes the item ID for purchase
var choseItem = function(){
	var newStock;
	inquirer.prompt([
		{
			type: "input", 
			name: "inputID", 
			message: "What is the ID number of the item you'd like to purchase?"
		},
		{
			type: "input", 
			name: "quantity", 
			message: "How many would you like to purchase?"
		}
	]).then(function(response){
		var query = connection.query(
			"SELECT * FROM products WHERE ?", 
			{
				item_id: response.inputID,
			}, 
			function(err, res){
				if (err) throw err;
				// console.log(res[0])
				//if statement to check whether or not there is enough stock to purchase
				if (res[0].stock_quantity >= response.quantity){
					// console.log("Quantity OK");
					// console.log(res[0].stock_quantity);
					// console.log(response.quantity);
					newStock = res[0].stock_quantity - response.quantity;
					// console.log(newStock);
					// console.log(response.inputID);
					updateStock(newStock, response.inputID);
					orderTotal(response.inputID, response.quantity);
				} else {
					console.log("Insuficient Quantity!");
					startAgain();
				}
			}
		)
		
	});
	
};

//updates stock depending on the quantity that user purchases
var updateStock = function(newStock, itemID){
	// console.log(newStock);
	// console.log(parseInt(itemID));	
	var query = connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				stock_quantity: newStock,
			},
			{
				item_id: parseInt(itemID)
			}
		], 
		function(err, res){
			// console.log("Stock updated");
		}
	)
	// console.log(query.sql);

}

//displays the order total based on what was purchase, and how many were purchased
var orderTotal = function(itemID, quantity){
	var totalPurchase;
	var totalSales = 0;
	var query = connection.query(
		"SELECT * FROM products WHERE ?", 
		{
			item_id: itemID,
		},
		function(err, res){
			totalPurchase = res[0].price * quantity;
			console.log("Total price: $" + totalPurchase);
			totalSales = totalPurchase + res[0].product_sales;
			updateSales(itemID, totalSales);
		}
	)
}

var updateSales = function(itemID, product_sales){
	var query = connection.query(
		"UPDATE products SET ? WHERE ?",
		[
			{
				product_sales: product_sales,
			},
			{
				item_id: itemID,
			}
		],
		function(err, res){
			if (err) throw err;
			// console.log("Product sales updated");
			startAgain();
		}
	)
}


