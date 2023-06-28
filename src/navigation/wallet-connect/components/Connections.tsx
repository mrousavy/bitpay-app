import React, {memo} from 'react';
import {Key, Wallet} from '../../../store/wallet/wallet.models';
import {EIP155_CHAINS} from '../../../constants/WalletConnectV2';
import WCV2WalletRow from './WCV2WalletRow';
import {useNavigation} from '@react-navigation/native';
import {
  WCV2SessionType,
  WCV2Wallet,
} from '../../../store/wallet-connect-v2/wallet-connect-v2.models';
import styled from 'styled-components/native';

const NoGutter = styled.View`
  margin: 0 -10px;
`;

const Connections = ({
  account,
  session,
  keys,
  wallet: _wallet,
}: {
  account?: string;
  session?: WCV2SessionType;
  keys?: {[key in string]: Key};
  wallet?: Wallet;
}) => {
  const navigation = useNavigation();
  let address, chain: string;
  let wallet: Wallet | undefined;

  const findWalletByAddress = (
    address: string,
    chain: string,
    network: string,
    keys: {[key in string]: Key},
  ): Wallet | undefined => {
    let wallet: Wallet | undefined;
    for (let key of Object.values(keys)) {
      wallet = key.wallets.find(
        w =>
          w.receiveAddress === address &&
          w.chain === chain &&
          w.network === network,
      );
      if (wallet) {
        return wallet;
      }
    }
  };

  if (account && keys) {
    // version 2
    const index = account.indexOf(':', account.indexOf(':') + 1);
    const protocolChainName = account.substring(0, index);
    address = account.substring(index + 1);
    chain = EIP155_CHAINS[protocolChainName]?.chainName;
    const network = EIP155_CHAINS[protocolChainName]?.network;
    wallet = findWalletByAddress(address, chain, network, keys);
  }

  const {keyId} = wallet || {};

  return wallet ? (
    <NoGutter key={wallet.id}>
      <WCV2WalletRow
        walletObj={{wallet}}
        topic={session?.topic}
        keyId={keyId!}
        isLast={false}
        onPress={(_keyId: string, walletObj: WCV2Wallet) => {
          navigation.navigate('WalletConnect', {
            screen: 'WalletConnectHome',
            params: {
              topic: session?.topic,
              wallet: walletObj.wallet,
            },
          });
        }}
        showCheckbox={false}
      />
    </NoGutter>
  ) : null;
};
export default memo(Connections);
