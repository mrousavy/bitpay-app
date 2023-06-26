import React from 'react';
import styled from 'styled-components/native';
import {BaseText, H2} from '../../../../components/styled/Text';
import {Black, LuckySevens, SlateDark, White} from '../../../../styles/colors';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../store';
import {
  calculatePercentageDifference,
  formatFiatAmount,
} from '../../../../utils/helper-methods';
import RefreshSvg from '../../../../../assets/img/refresh.svg';
import {useAppSelector} from '../../../../utils/hooks';
import Percentage from '../../../../components/percentage/Percentage';
import {useTranslation} from 'react-i18next';
import {DeviceEventEmitter} from 'react-native';
import {DeviceEmitterEvents} from '../../../../constants/device-emitter-events';
import Button from '../../../../components/button/Button';

const PortfolioContainer = styled.View`
  justify-content: center;
  align-items: center;
  margin-top: 25px;
`;

const PortfolioBalanceHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const PortfolioBalanceTitle = styled(BaseText)`
  margin-right: 5px;
  font-size: 14px;
  color: ${({theme: {dark}}) => (dark ? White : SlateDark)};
`;

const PortfolioBalanceText = styled(BaseText)`
  font-weight: bold;
  font-size: 31px;
  color: ${({theme}) => theme.colors.text};
`;

const PercentageText = styled(BaseText)`
  font-size: 12px;
  color: ${({theme: {dark}}) => (dark ? LuckySevens : Black)};
`;

const PercentageContainer = styled.View`
  flex-direction: row;
  margin-top: 5px;
`;

const PortfolioBalance = () => {
  const {t} = useTranslation();
  const portfolioBalance = useSelector(
    ({WALLET}: RootState) => WALLET.portfolioBalance,
  );

  const {defaultAltCurrency, hideAllBalances} = useAppSelector(({APP}) => APP);

  const totalBalance: number = portfolioBalance.current;

  const percentageDifference = calculatePercentageDifference(
    portfolioBalance.current,
    portfolioBalance.lastDay,
  );

  const onUpdateBalance = () => {
    DeviceEventEmitter.emit(DeviceEmitterEvents.WALLET_BALANCE_UPDATED);
  };

  return (
    <PortfolioContainer>
      <PortfolioBalanceHeader>
        <PortfolioBalanceTitle>{t('Portfolio Balance')}</PortfolioBalanceTitle>
        <Button buttonType={'link'} height={28} onPress={onUpdateBalance}>
          <RefreshSvg width={12} height={12} />
        </Button>
      </PortfolioBalanceHeader>
      {!hideAllBalances ? (
        <>
          <PortfolioBalanceText>
            {formatFiatAmount(totalBalance, defaultAltCurrency.isoCode, {
              currencyDisplay: 'symbol',
            })}
          </PortfolioBalanceText>
          {percentageDifference ? (
            <PercentageContainer>
              <Percentage percentageDifference={percentageDifference} />
              <PercentageText> {t('Last Day')}</PercentageText>
            </PercentageContainer>
          ) : null}
        </>
      ) : (
        <H2>****</H2>
      )}
    </PortfolioContainer>
  );
};

export default PortfolioBalance;
