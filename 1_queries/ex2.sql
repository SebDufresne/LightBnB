SELECT properties.id, title, cost_per_night, ROUND(avg(property_reviews.rating),2) as average_rating
FROM properties
JOIN property_reviews ON properties.id = property_id
GROUP BY properties.id
HAVING avg(property_reviews.rating) > 4
ORDER BY average_rating;