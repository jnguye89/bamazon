var mysql = require ('mysql');
var inquirer = require('inquirer');
require('console.table');

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

	// connection.end();
	// startAgain();
	start();
});

var start = function(){
	inquirer.prompt([
		{
			type: 'list',
			name: 'task', 
			message: 'What task would you like to complete?',
			choices: ['View Product Sales by Department', 'Create New Department', 'Exit']
		}
	]).then(function(response){
		switch (response.task){
			case 'View Product Sales by Department':
				productSalesDept();
				break;
			case 'Create New Department':
				newDepartment();
				break;
			case 'Exit':
				connection.end();
				break;
			default:
				connection.end();
		}

	})
};

var productSalesDept = function(){
	var query = "SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS product_sales,SUM(products.product_sales - departments.over_head_costs) AS total_sales";
	query += " FROM products INNER JOIN departments ON departments.department_name = products.department_name";
	query += " GROUP BY departments.department_id";
	console.log(query);
	connection.query(query,function(err, res){
		if (err) throw err;

		console.table(res);
		start();
	})
}



var newDepartment = function(){
	inquirer.prompt([
			{
				type: "input",
				name: "department_name", 
				message: "Department name: "
			}, 
			{
				type: "input", 
				name: "over_head_costs", 
				message: "Department over head costs: "
			}
		]).then(function(response){
			var query = connection.query(
				"INSERT INTO departments SET ?", 
				{
					department_name: response.department_name,
					over_head_costs: response.over_head_costs
				}, 
				function(err,res){
					console.log("New department successfully added!");
					start();
				}
			)
		})

}












