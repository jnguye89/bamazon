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

	console.log("connected as id " + connection.threadId);

	start();
});

//gives manager option of tasks
var start = function(){
	inquirer.prompt([
		{
			type: 'list',
			name: 'task', 
			message: 'What task would you like to complete?',
			choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit']
		}	
	]).then(function(response){
		switch (response.task){
			case 'View Products for Sale':
				displayItemsAvailable()
				break;
			case 'View Low Inventory':
				lowInventory()
				break;
			case 'Add to Inventory':
				addInventory()
				break;
			case 'Add New Product':
				addProduct()
				break;
			case 'Exit':
				connection.end()
				break;
			default:
				connection.end();
		}
	})
}

//displays all available items in inventory/for sale
var displayItemsAvailable = function(){
	var query = connection.query(
		"SELECT * FROM products", 
		function(err, res){
			if (err) throw err;
			res.forEach(function(value){
				console.log("Item ID: " + value.item_id + "\nProduct name: " + value.product_name + "\nDepartment: " + value.department_name + "\nPrice: $" + value.price + "\nStock Quantity: " + value.stock_quantity + "\n");
			});
			start();
		});

};

//displays all items in inventory that have a stock quantity of 5 or less
var lowInventory = function(){
	var query = connection.query(
		"SELECT * FROM products WHERE stock_quantity < 6",
		function(err, res){
			if (err) throw err;

			res.forEach(function(value){
				console.log("Item ID: " + value.item_id + "\nProduct name: " + value.product_name + "\nDepartment: " + value.department_name + "\nPrice: $" + value.price + "\nStock Quantity: " + value.stock_quantity + "\n");
			});
			start();
		})
}

//allows manager to increase inventory count of existing products. 
var addInventory = function(){
	// displayItemsAvailable();
	var newStock;
	inquirer.prompt([
		{
			type: "input", 
			name: "inputID", 
			message: "What is the ID number of the item you'd like to add inventory to?"
		},
		{
			type: "input", 
			name: "quantity", 
			message: "How many would you like to add to inventory?"
		}
	]).then(function(response){
		var query = connection.query(
			"SELECT * FROM products WHERE ?", 
			{
				item_id: parseInt(response.inputID)
			}, 
			function(err, res){
				if (err) throw err;
				// console.log(res[0].stock_quantity)
				newStock = parseInt(res[0].stock_quantity) + parseInt(response.quantity);
				console.log(newStock);

				updateStock(newStock, response.inputID);
			}
			)
		// console.log(query.sql);
		
	})
}

var updateStock = function(newStock, inputID){
	var query = connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				stock_quantity: newStock
			},
			{
				item_id: parseInt(inputID)
			}
		], 
		function(err, res){
			if (err) throw err;
			console.log("Inventory Updated");
			start();
		}
		)
}

var addProduct = function(){
	inquirer.prompt([
		{
			type: "input", 
			name: "product_name", 
			message: "Enter proudct name: "
		},
		{
			type: "input", 
			name: "department_name", 
			message: "Enter department name: "
		},
		{
			type: "input", 
			name: "price", 
			message: "Enter product price: $"
		},
		{
			type: "input", 
			name: "stock_quantity",
			message: "How much inventory do you have?"
		}
		]).then(function(response){
			var query = connection.query(
				"INSERT INTO products SET ?", 
				{
					product_name: response.product_name,
					department_name: response.department_name,
					price: response.price,
					stock_quantity: response.stock_quantity
				},
				function(err, res){
					console.log("New item successfully added.")
					start();
				}
				)
		})
}





