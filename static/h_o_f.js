function showHallOfFame() {
    fetch('/hall_of_fame', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            // извини, таблицей
            let hallOfFameContent = `<h2>Доска почёта</h2><table border='1'><tr><th><font color="lightgrey">Игрок</font></th><th><font color="lightgrey">Набранные очки</font></th></tr>`;
            data.forEach(player => {
                hallOfFameContent += `<tr><td><font color="lightgreen">${player.user_name}</font></td><td><font color="tomato">${player.total_score}</font></td></tr>`;
            });
            hallOfFameContent += "</table>";
			hallOfFameContent += "<br>";
            // попробую поп ап так
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.padding = '20px';
            popup.style.backgroundColor = 'darkblue';
            popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
            popup.innerHTML = hallOfFameContent;

            const closeButton = document.createElement('button');
            closeButton.textContent = "Понятно...";
            closeButton.onclick = () => document.body.removeChild(popup);
            popup.appendChild(closeButton);

            document.body.appendChild(popup);
        })
        .catch(error => {
            console.error('Backend не отвечает JSON структурой с Hall of Fame:', error);
        });
}