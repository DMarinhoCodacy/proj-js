using System.Collections.Generic;
using LSports.Core.Common.Extensions;
using LSports.Data.Core.Legacy.ProviderBet;
using LSports.Data.Core.Legacy.ProviderMarket;
using LSports.RobotsCommon.Extensions;
using LSports.RobotsFramework.Entities.Bases;
using LSports.RobotsFramework.Entities.Models;
using LSports.RobotsFramework.MarketHandlers.Bases;

namespace LSports.Robots.ProvidersCommon.OneXBet.Logic.MarketHandlers
{
    public class TeamWinsCommonMarketHandler : SimpleMarketHandlerBase<MarketItem>
    {
        protected override List<string> MatchCases { get; }= new List<string> {"Team Wins"};


        protected override ProviderBet HandleBetInternal(BetItemBase betItem)
        {
            betItem.Name = betItem.Name.Remove("Team","Wins");
            return base.HandleBetInternal(betItem);
        }

        protected override bool TryAddBet(ProviderMarket providerMarket, ProviderBet providerBet)
        {

            if (string.IsNullOrEmpty(providerBet.Name) || providerBet.Name.CompareContent("draw"))
            {
                return false;
            }
            return base.TryAddBet(providerMarket, providerBet);
        }
    }
}