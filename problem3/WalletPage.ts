interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // assume blockchain all is string format ...
}

interface Prices {
  [currency: string]: number; // assume the return json objects in this format ...
}

class Datasource {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getPrices(): Promise<Prices> {
    try {
      const response = await fetch(this.url);
      if (!response.ok) throw new Error("Failed to fetch prices");
      return response.json();
    } catch (error) {
      console.error("Error fetching prices:", error);
      throw error;
    }
  }
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;

  const balances: WalletBalance[] = useWalletBalances(); // assume the type correct
  const [prices, setPrices] = useState<Prices>({});

  const datasourceUrl = "https://interview.switcheo.com/prices.json";

  useEffect(() => {
    let mounted = true;
    const datasource = new Datasource(datasourceUrl);
    datasource
      .getPrices()
      .then((prices) => {
        if (mounted) setPrices(prices);
      })
      .catch((error) => {
        if (mounted) console.error(error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // should the priority be the same? not sure about this, here assume can be the same ...
  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (balancePriority > -99) {
          if (balance.amount >= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority; // Descending order, considered the equal priority situations ...
      });
  }, [balances]);

  // add the useMemo to avoid unnecessary re-calculation
  const rows = useMemo(() => {
    return sortedBalances.map(
      (balance: FormattedWalletBalance, index: number) => {
        const usdValue = prices[balance.currency] * balance.amount;
        const formattedAmt: string = balance.amount.toFixed();
        return (
          <WalletRow
            className={classes.row}
            key={index}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={formattedAmt}
          />
        );
      }
    );
  }, [sortedBalances]);

  return <div {...rest}>{rows}</div>;
};
