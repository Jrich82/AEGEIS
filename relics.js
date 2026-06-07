// ============== RELICS GET TEETH: coin, shard, sigil ==============
// Rusty Coin  — feed it to the dark: +8 Echo (tribute to the Vaults).
// Bone Shard  — hone your edge on it: +1 melee damage for the current floor (stacks).
// Faded Sigil — it drinks what was written into you: Corruption -4. The only cleanser.
// Click them in the inventory. Loads after the engine; wraps, edits nothing.

var shardBonus = 0;

(function(){
  var _use = useItem;
  useItem = function(n){
    var i = inventory.indexOf(n);
    if (n==="Rusty Coin" && i>=0){
      inventory.splice(i,1);
      echo += 8; document.getElementById("echo").innerText = echo;
      dmSay("You feed the coin to the dark. The Vaults pay their debts in Echo (+8).","log-loot");
      checkLevel(); renderInv(); renderStats();
      return;
    }
    if (n==="Bone Shard" && i>=0){
      inventory.splice(i,1);
      shardBonus++;
      dmSay("You hone your edge on the humming bone. +1 melee damage on this floor (now +"+shardBonus+").","log-loot");
      renderInv(); renderStats();
      return;
    }
    if (n==="Faded Sigil" && i>=0){
      inventory.splice(i,1);
      corruption = Math.max(0, corruption-4);
      dmSay("The sigil drinks a little of what was written into you. CORRUPTION -4.","log-win");
      renderInv(); renderStats();
      return;
    }
    _use(n);
  };
  var _mb = meleeBonus; meleeBonus = function(){ return _mb() + shardBonus; };
  var _de = descend;    descend   = function(){ shardBonus = 0; _de(); };
  var _qr = qudReset;   qudReset  = function(){ _qr(); shardBonus = 0; };
})();
