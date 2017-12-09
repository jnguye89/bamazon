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

	displayItemsAvailable();
});


var displayItemsAvailable = function(){
	var query = connection.query(
		"SELECT * FROM products", 
		function(err, res){
			if (err) throw err;
			res.forEach(function(value){
				console.log("Item ID: " + value.item_id + "\nProduct name: " + value.product_name + "\nDepartment: " + value.department_name + "\nPrice: $" + value.price + "\n");
			});
			choseItem();
		});
	
};

var choseItem = function(){
	var newStock;
	inquirer.prompt([
		{
			type: "input", 
			name: "inputID", 
			message: "What is the ID number of the item you'd like to purchse?"
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
				if (res[0].stock_quantity > response.quantity){
					console.log("Quantity OK");
					// console.log(res[0].stock_quantity);
					// console.log(response.quantity);
					newStock = res[0].stock_quantity - response.quantity;
					// console.log(newStock);
					// console.log(response.inputID);
					updateStock(newStock, response.inputID);
					orderTotal(response.inputID, response.quantity);
				} else {
					console.log("Insuficient Quantity!");
				}
			}
			)
		
	});
	
};


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
			console.log("Stock updated");
		}
	)
	console.log(query.sql);
	connection.end();
}

var orderTotal = function(itemID, quantity){
	var query = connection.query(
		""
		)
}


