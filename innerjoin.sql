USE bamazon;

SELECT 
	departments.department_name, SUM(products.product_sales) AS department_sales,SUM(products.product_sales - departments.over_head_costs) AS total_sales
FROM
	products
INNER JOIN departments ON departments.department_name = products.department_name
GROUP BY departments.department_name;

