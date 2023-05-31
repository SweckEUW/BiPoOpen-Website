<script setup lang="ts">
</script>

<template>
    <div class="Rules">
        <h2 class="bp-title">Regeln</h2>
        <div>
            Das Beginner-Team, wird durch eine einfache Runde Schnick-Schnack-Schnuck (ohne Brunnen ausgewählt).
            Ein Cup gilt als getroffen, wenn der Ball in einen Cup fliegt und dort liegen bleibt. 
            Wird ein Cup getroffen, muss dieser leer getrunken werden. Der Ball darf nur berührt werden, wenn er zuvor den Tisch oder einen Cup berührt hat.
            Ablenkungsmanöver sind erlaubt, Cups, Tisch und Gegner dürfen dabei jedoch nicht berührt werden. 
            Das Erzeugen eines Windstoßes zum Verändern des Fluglinie des Balles sowie das Herauspusten oder Herausfingern von Bällen aus Bechern ist verboten.
        </div>

        <h1>Wurf</h1>
        <div>
            Jedes Team hat pro Zug zwei Würfe. 
            Verlässt der Ball die Hand des Werfers, so ist der Ball im Spiel und gilt als geworfen.
            Damit ein Treffer gültig ist, muss der Ellenbogen beim Wurf hinter der Kante des Tisches verbleiben.
            Fällt ein Cup wegen eines Balles um, muss der Rest getrunken werden und der Becher ist aus dem Spiel.
            Wirft ein Spieler absichtlich oder unabsichtlich einen oder mehrere seiner eigenen Cups vom Tisch, gelten diese als getroffen und sind aus dem Spiel.
        </div>

        <h1>Bounce Back</h1>
        <div>
            Springt der Ball auf dem Tisch auf, bevor er in einen Becher geht, müssen die Verteidiger zewi Becher trinken.
            Sobald der Ball den Tisch berührt hat, darf er jedoch weggeschlagen werden.
            Der zweite Becher wird vom Werfer ausgewählt. 
            Diese Regel ist nicht anzuwenden, wenn der Ball statt vom Tisch lediglich vom Becherrand abspringt. 
        </div>

        <h1>Bombe</h1>
        <div>
            Wenn ein Team mit beiden Bällen in denselben Becher trifft, müssen drei Becher getrunken werden.
            Die Werfer entscheiden, welche Becher das sind und erhalten die Bälle zurück.
        </div>

        <h1>Balls Back</h1>
        <div>
            Versenkt ein Team beide Bälle in einer Runde, bekommt es beide Bälle zurück und darf noch einmal werfen.
        </div>

        <h1>On-Fire</h1>
        <div>
            Trifft ein Spieler zwei Becher in Folge, muss dieser "Heaten Up" sagen.
            Trifft er im Anschluss den dritten Becher, ist er "On Fire" und darf solange werden, bis er nicht mehr trifft.
        </div>

        <h1>Trickshot</h1>
        <div>
            Wird ein geworfener, aber nicht getroffener Ball vom Wurfteam gegriffen, bevor dieser den Boden berührt, so ist der Werfer erneut dran.
            Der Wurf muss aber ein Trickshot sein.
            Als Trickshot gilt nicht der Wurf mit der schwachen Hand. 
            Zur Verhinderung eines Trickhots hat das andere Team ebenfalls die Möglichkeit, den Ball auf dem gesamten Tisch abzufangen.
        </div>

        <h1>Re-Rack</h1>
        <div>
            Zweimal pro Spiel darf jedes Team seine Gegner bitten, die Becher neu zu positionieren.
            Möglich ist dies bei je 3, 4 oder 6 Bechern (nicht möglich bei einer anderen Becheranzahl, beispielsweise 2, 5 oder 7). 
            Die neue Formation ist immer mittig vorne (an der Pyramidenspitze) zu positionieren.
        </div>

        <h1>Deathcup</h1>
        <div>
            Landet der Ball in einem ausgeschiedenen, aber noch nicht ausgetrunkenen Becher, verliert das getroffene Team sofort.
        </div>

        <h1>Spielende</h1>
        <div>
            Das Spiel gilt als gewonnen, wenn ein Team alle Becher des Gegners getroffen hat.
            Befindet sich nur noch ein Becher im Feld, wird dieser in die Spitze der Pyramide gestellt.
            Der letzte Becher muss dabei einzeln getroffen werden (und nicht etwa infolge eines Bounce-Backs oder einer Bombe).
            Wird der letzte Becher von beiden Bällen getroffen, so ist die Runde direkt gewonnen. 
            Trifft nur ein Ball den letzten Becher, so gilt Gentleman's Rule. Das Gegnerteam hat Nachwurf.
            Trifft dieses Team nun ebenfalls seine letzten Becher, geht das Spiel in die Verlängerung mit 2x3 Cups (Ausnahme: trifft nach der Gentleman's Rule das Nachwerferteam seinen letzten Becher mit beiden Bällen, so das dieses Team direkt gewonnen).
        </div>

    </div>
</template>

<style scoped>
.Rules{
    width: 90%;
    width: 90%;
    margin: auto;
}
h1{
    font-size: 24px;
    width: 100%;
    text-align: center;
    color: var(--secondary-color);
}
div{
    margin-top: 5px;
    margin-bottom: 60px;
}

/*MOBILE*/
@media (width <= 900px){
    div{
        margin-top: 5px;
        margin-bottom: 30px;
    }
}
</style>
