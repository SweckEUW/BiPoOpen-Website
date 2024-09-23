<script setup lang="ts">
</script>

<template>
    <div class="Rules">

        <h1 class="bp-title">{{"Regeln"}}</h1>
        
        <h2 style="margin-bottom: 20px;">Zusammenfassung</h2>
        <div style="margin-bottom: 100px;">
            <ul style="padding-left: 20px;">
                <li>Schnick-Schnack-Schnuck, wer anfängt</li>
                <li>2 Becher werden bei einem "Bouncer" getrunken</li>
                <li>3 Becher werden bei einer "Bombe" getrunken</li>
                <li>2 Mal Re-Rack pro Spiel. Nur bei 3, 4 oder 6 Bechern möglich</li>
                <li>Mit Gentleman's Rule (Nachwurf der gegnerischen Mannschaft bei letzten getroffenem Becher)</li>
                <li>Mit Deathcup Regel (Direkte Niederlage bei Treffern in noch nicht ausgetrunkenen Becher)</li>
                <li>Mit On-Fire Regel (Bei 3 Treffern in Folge, werfen solange nicht mehr getroffen wird)</li>
                <li>Mit Trickshot Regel (Trickshot, wenn Ball nach Wurf vom Wurfteam gegriffen, bevor dieser den Boden berührt)</li>
            </ul>
        </div>

        <h2>Spielbeginn</h2>
        <div>
            Das Beginner-Team, wird durch eine einfache Runde Schnick-Schnack-Schnuck ausgewählt.
            Ein Cup gilt als getroffen, wenn der Ball in einen Cup fliegt und dort liegen bleibt <strong>(Pusten, Fingern oder ähnliche Taktiken sind nicht erlaubt)</strong>.  
            Wird ein Cup getroffen, muss dieser getrunken werden.
            Das Spiel gilt als gewonnen, wenn ein Team alle Becher des Gegners getroffen hat.
        </div>

        <h2>Wurf</h2>
        <div> 
            Jedes Team hat pro Zug zwei Würfe. 
            Verlässt der Ball die Hand des Werfers, so ist der Ball im Spiel und gilt als geworfen.
            Damit ein Treffer gültig ist, muss der <strong>Ellenbogen beim Wurf hinter der Kante des Tisches verbleiben</strong>.
            Fällt ein Cup wegen eines Balles um, muss der Rest getrunken werden und der Becher gilt als getroffen.
            Wirft ein Spieler absichtlich oder unabsichtlich einen oder mehrere seiner eigenen Cups vom Tisch, gelten diese als getroffen.
            Wird ein Ball vom Gegnerteam gefangen, bevor der Ball den Tisch oder einen Becher berührt, gilt der Wurf als Treffer. Der Werfer darf sich den getroffenen Becher auswählen.   
        </div>

        <h2>Bouncer</h2>
        <div>
            Springt der Ball auf dem Tisch auf, bevor er in einen Becher geht, müssen die Verteidiger zwei Becher trinken.
            Sobald der Ball den Tisch berührt hat, darf er jedoch weggeschlagen werden.
            <strong>Der zweite Becher wird vom Werfer ausgewählt</strong>. 
            Diese Regel ist nicht anzuwenden, wenn der Ball statt vom Tisch lediglich vom Becherrand abspringt. 
        </div> 

        <h2>Balls Back</h2>
        <div>
            Versenkt ein Team beide Bälle in einer Runde, bekommen beide Werfer die Bälle zurück und sie dürfen erneut werfen.
        </div>

        <h2>Bombe</h2>
        <div>
            Wenn ein Team mit beiden Bällen in denselben Becher trifft, müssen drei Becher getrunken werden.
            <strong>Die Werfer entscheiden, welche Becher das sind</strong> und erhalten die Bälle zurück.
        </div>

        <h2>On-Fire</h2>
        <div>
            Trifft ein Spieler zwei Becher in Folge, muss dieser <strong>"Heaten Up"</strong> sagen.
            Trifft er in der nächsten Runde den dritten Becher in Folge, ist er <strong>"On Fire"</strong>. Er erhält daraufhin den Ball zurück und darf solange werfen, bis er nicht mehr trifft.
        </div>

        <h2>Trickshot</h2>
        <div>
            <strong>Wird ein geworfener, aber nicht getroffener Ball vom Wurfteam gegriffen, bevor dieser den Boden berührt, so ist der Werfer erneut dran</strong>. 
            Der Wurf muss ein Trickshot sein.
            Zur Verhinderung eines Trickhots hat das andere Team ebenfalls die Möglichkeit, den Ball auf dem gesamten Tisch abzufangen.
            Als Trickshot gilt nicht der Wurf mit der schwachen Hand. 
        </div>

        <h2>Re-Rack</h2>
        <div>
            <strong>Zweimal pro Spiel</strong> darf ein Team seine Gegner bitten, die Becher neu zu positionieren.
            <strong>Möglich ist dies nur bei 3, 4 oder 6 Bechern (nicht möglich bei einer anderen Becheranzahl, beispielsweise 2, 5 oder 7).</strong>
            Die neue Formation ist immer mittig vorne (an der Pyramidenspitze) zu positionieren.
            Geworfen darf erst wieder, wenn das zusammenstellende Team die Becher freigibt. 
        </div>

        <h2>Deathcup</h2>
        <div>
            Landet der Ball in einem getroffenen, aber noch nicht ausgetrunkenen Becher, <strong>verliert das getroffene Team sofort das Spiel</strong>.
        </div>

        <h2>Spielende</h2>
        <div>
            Das Spiel gilt als gewonnen, wenn ein Team alle Becher des Gegners getroffen hat.
            Befindet sich <strong>nur noch ein Becher im Feld, wird dieser in die Spitze der Pyramide gestellt</strong>.
            Der letzte Becher muss dabei einzeln getroffen werden (und nicht etwa infolge eines Bounce-Backs oder einer Bombe).
            <strong>Wird der letzte Becher von beiden Bällen getroffen, so ist die Runde direkt gewonnen.</strong>
        </div>
        
        <h2>Gentleman's Rule</h2>
        <div>
            Nachdem das gegnerische Team den letzten Becher getroffen hat greift die Gentleman's Rule und das andere Team darf nachwerfen. 
            Trifft dieses Team nun ebenfalls seine letzten Becher, geht das Spiel in die Verlängerung mit 2x3 Cups (Ausnahme: trifft nach der Gentleman's Rule das Nachwerferteam seinen letzten Becher mit beiden Bällen, so hat dieses Team direkt gewonnen).
            <strong>Ein Spieler kann bei der Gentleman's Rule solange in Folge werfen, bis er nicht mehr trifft.</strong>
        </div>
    </div>
</template>

<style scoped>
.Rules{
    width: 90%;
    width: 90%;
    margin: auto;
}
h2{
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
