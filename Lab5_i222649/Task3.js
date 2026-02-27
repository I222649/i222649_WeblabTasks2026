let movies = [];

function addMovie(title, director, genre, year) {
  movies.push({ title, director, genre, year });
}

function listMovies() {
  return movies.map(m =>
    `${m.title} (${m.year}) - Directed by ${m.director} [${m.genre}]`
  ).join("\n");
}

function searchByDirector(director) {
  return movies.filter(m =>
    m.director.toLowerCase() === director.toLowerCase()
  );
}

function searchByGenre(genre) {
  return movies.filter(m =>
    m.genre.toLowerCase() === genre.toLowerCase()
  );
}

addMovie("Inception", "Christopher Nolan", "Sci-Fi", 2010);
addMovie("The Dark Knight", "Christopher Nolan", "Action", 2008);
addMovie("Interstellar", "Christopher Nolan", "Sci-Fi", 2014);
addMovie("Parasite", "Bong Joon-ho", "Thriller", 2019);

console.log("--- All Movies ---");
console.log(listMovies());

console.log("\n--- Nolan Movies ---");
console.log(searchByDirector("christopher nolan"));

console.log("\n--- Sci-Fi Movies ---");
console.log(searchByGenre("sci-fi"));