<template>
	<div class="Imprint">
        <h1 class="bp-title">Impressum</h1>

        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
            Simon Weck
            <br/>
            Kaspar-von-Zumbusch-Straße 6
            <br/>
            33378 Rheda-Wiedenbrück
        </p>

        <h2>Vertreten durch:</h2>
        <p>Simon Weck</p>

        <h2>Kontakt</h2>
        <p>
            Telefon: 0176 71236857
            <br/>
            E-Mail: Simon.Weck98@yahoo.de
        </p>
        
        <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h2>
        <p>
            Simon Weck
            <br/>
            Kaspar-von-Zumbusch-Straße 6
            <br/>
            33378 Rheda-Wiedenbrück
        </p>

        <h2 style="margin-bottom: 0;">Haftungsausschluss:</h2>

        <h2 style="margin-top: 10px;">Haftung für Inhalte</h2>
        <p>
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. 
            Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. 
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. 
            Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>

        <h2>Haftung für Links</h2>
        <p>
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. 
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. 
            Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. 
            Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. 
            Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>


        <h2>Urheberrecht</h2>
        <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. 
            Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. 
            Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. 
            Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. 
            Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. 
            Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
        </p>

	</div>
</template>

<style scoped>
.Imprint{
    display: flex;
    flex-direction: column;
    align-content: center;
    flex-wrap: wrap;
    text-align: left;
    width: 50%;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50px;
}
h2{
    margin-bottom: 2px;
    margin-top: 30px;
}
p{
    margin: 0;
}

/* Mobile */
@media (width <= 900px){
	.Imprint{
		margin-bottom: 20px;
		width: 90%;
	}
}
</style>