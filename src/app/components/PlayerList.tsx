export default function PlayerList(props : any) {
    let playerList = props.playerList
    return (
        <div className="px-2">
            {/* Active players list  */}
            <p className="text-lg mt-5"><span className="text-blue-500 font-bold">{playerList.length}</span> player(s) online</p>

            <div className="grid grid-cols-2 gap-4 mt-5">

                {/* Player list */}
                {
                Array.isArray(playerList) ? playerList.map((player, index) => (
                    <div className="row-span-2 col-span-1 border rounded-lg shadow-sm px-3 py-3" key={index}>
                        <div className="player-card flex">
                            <p className="truncate">{player.player_name}</p>

                            {/* Display this for the game admin */}
                            { index === 0 && <span className="ml-4 bg-pink-100 text-xs text-pink-500 drop-shadow-xs rounded-lg px-3 py-1">Host</span>}
                        </div>
                    </div>
                )) : ''
                }
            </div>
        </div>
    )
}
