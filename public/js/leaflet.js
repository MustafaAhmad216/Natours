export function displayMap(locations) {
	let map = L.map('map', {
		center: [51.505, -0.09],
		zoom: 6,
	});
	// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	// }).addTo(map);

	L.tileLayer(`https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}`, {
		foo: 'bar',
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	const points = [];
	locations.forEach((loc) => {
		const myIcon = L.divIcon({
			className: 'marker',
			iconSize: [25, 30],
		});

		points.push(loc.coordinates[1], loc.coordinates[0]);
		L.marker([loc.coordinates[1], loc.coordinates[0]], {
			icon: myIcon,
		})
			.addTo(map)
			.bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
				autoClose: false,
			})
			.openPopup();
	});

	map.setView([points[0], points[1]], 6);
};
