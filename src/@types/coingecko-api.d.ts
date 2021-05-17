/*
|--------------------------------------------------------------------------
| Module definition for coingecko-api lib
|--------------------------------------------------------------------------
*/

declare module "coingecko-api" {
  class CoinGecko {
    coins: {
      fetchMarketChartRange(
        coinId: string,
        params: {
          vs_currency: string;
          from: number;
          to: number;
        }
      ): any;
    };
    simple: {
      price(params: {
        ids: string;
        vs_currencies: string;
        include_24hr_vol?: boolean;
        include_24hr_change?: boolean;
        include_last_updated_at?: boolean;
      }): any;
    };
  }
  export default CoinGecko;
}
