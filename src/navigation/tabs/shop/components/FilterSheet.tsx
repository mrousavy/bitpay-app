import React, {useState} from 'react';
import SheetModal from '../../../../components/modal/base/sheet/SheetModal';
import {BaseText, H4, TextAlign} from '../../../../components/styled/Text';
import styled, {css} from 'styled-components/native';
import {
  SheetContainer,
  SheetParams,
} from '../../../../components/styled/Containers';
import {Platform} from 'react-native';
import {
  Action,
  Black,
  LinkBlue,
  NotificationPrimary,
  Slate,
  White,
} from '../../../../styles/colors';
import {Theme} from '@react-navigation/native';
import {horizontalPadding} from './styled/ShopTabComponents';
import {sleep} from '../../../../utils/helper-methods';
import {
  BottomNotificationCta,
  BottomNotificationHr,
} from '../../../../components/modal/bottom-notification/BottomNotification';

const SheetTitleContainer = styled.View`
  margin-bottom: 25px;
`;

const CtaContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  ${({platform}: {platform: string}) =>
    platform === 'ios' &&
    css`
      margin-bottom: 10px;
    `}
`;

const PillSheetContainer = styled(SheetContainer)`
  padding: ${horizontalPadding}px;
`;

const Pills = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

interface PillParams {
  selected?: boolean;
}

const Pill = styled.View<PillParams>`
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 2px solid ${Action};
  border-radius: 50px;
  margin-right: 10px;
  margin-bottom: 12px;
  ${({selected}) => (selected ? `background-color: ${Action};` : '')};
`;

const PillText = styled(BaseText)<PillParams>`
  color: ${({selected, theme}) =>
    selected ? White : theme.dark ? White : Action};
  font-weight: 500;
  padding: 8px 12px;
`;

export type CategoryMap = {[category: string]: boolean};
interface Props extends SheetParams {
  isVisible: boolean;
  closeModal: () => void;
  title?: string;
  categories: CategoryMap;
  onSelectionChange: (categories: CategoryMap) => void;
}

export const initializeCategoryMap = (categories: string[]) => {
  return categories.reduce((map, category) => {
    map[category] = false;
    return map;
  }, {} as {[category: string]: boolean});
};

const FilterSheet = ({
  isVisible,
  closeModal,
  categories,
  onSelectionChange,
}: Props) => {
  const [initialCategoryMap, setInitialCategoryMap] = useState(categories);
  const [categoryMap, setCategoryMap] = useState(categories);
  return (
    <SheetModal
      isVisible={isVisible}
      onBackdropPress={() => {
        setCategoryMap(initialCategoryMap);
        closeModal();
      }}>
      <PillSheetContainer>
        <SheetTitleContainer>
          <TextAlign align={'left'}>
            <H4>Filter Gift Cards</H4>
          </TextAlign>
        </SheetTitleContainer>
        <Pills>
          {Object.keys(categoryMap).map(category => (
            <Pill key={category} selected={categoryMap[category]}>
              <PillText
                selected={categoryMap[category]}
                onPress={() =>
                  setCategoryMap({
                    ...categoryMap,
                    [category]: !categoryMap[category],
                  })
                }>
                {category}
              </PillText>
            </Pill>
          ))}
        </Pills>
        <BottomNotificationHr />
        <CtaContainer platform={Platform.OS}>
          <BottomNotificationCta
            suppressHighlighting={true}
            primary={true}
            onPress={async () => {
              onSelectionChange(categoryMap);
              closeModal();
              await sleep(1000);
              setInitialCategoryMap(categoryMap);
            }}>
            {'Apply Filter'.toUpperCase()}
          </BottomNotificationCta>
          <BottomNotificationCta
            suppressHighlighting={true}
            primary={false}
            onPress={() =>
              setCategoryMap(initializeCategoryMap(Object.keys(categoryMap)))
            }>
            {'Clear'.toUpperCase()}
          </BottomNotificationCta>
        </CtaContainer>
      </PillSheetContainer>
    </SheetModal>
  );
};

export default FilterSheet;
