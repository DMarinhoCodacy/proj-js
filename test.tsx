import React from "react"
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native"

import { Style } from "gametime/constants/styles"
import MediumIcon, { Icon as BigIcon, ICON_SIZE as MEDIUM_ICON_SIZE } from "gametime/core_components/icons/MediumIcon"
import SmallIcon, { Icon } from "gametime/core_components/icons/SmallIcon"
import TouchableOSAgnostic from "gametime/core_components/touchableOSAgnostic"

const styles = StyleSheet.create({
    buttonContainer: {
      alignItems: "center",
      flex: 1,
      flexDirection: "row",
      height: MEDIUM_ICON_SIZE,
      justifyContent: "center",
    },
    container: {
      alignItems: "center",
      borderColor: Style.Colors.Gray.regular.rgbString,
      borderRadius: Style.CornerRadii.genericButtonWithIconsRadii,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "center",
      marginHorizontal: Style.Margins.small,
      overflow: "visible",
      paddingLeft: Style.Padding.mediumLarge,
      paddingRight: Style.Padding.medium,
      paddingVertical: Style.Padding.verySmall,
    },
    disabledStyle: {
      opacity: Style.Colors.Alpha.semiTranslucent
    },
    enabledStyle: {
      opacity: Style.Colors.Alpha.opaque
    },
    leftIconStyle: {
      marginRight: Style.Margins.small
    },
    selectedContainer: {
      backgroundColor: Style.Colors.White.absolute.rgbString,
      borderColor: Style.Colors.White.absolute.rgbString
    },
    selectedTitle: {
      color: Style.Colors.Black.absolute.rgbString,
    },
    title: {
      paddingRight: Style.Padding.small,
    },
    titleContainer: {
      flexDirection: 'row',
    },
    titleIcon: {
      marginTop: Style.Margins.verySmall,
    },
    unselectedTitle: {
      color: Style.Colors.White.absolute.rgbString,
    }
  })
  
  
  export interface NomniBarChipButtonProps {
    title: string
    onPress: () => void
    enabled: boolean
    leftIcon?: Icon
    titleIcon?: Icon
    selected?: boolean
    showCaret?: boolean
    style?: StyleProp<ViewStyle>
    containerStyle?: StyleProp<ViewStyle>
    textStyle?: StyleProp<TextStyle>
  }

  const NomniBarChipButton = ({
    enabled,
    onPress,
    title,
    leftIcon,
    titleIcon,
    selected,
    showCaret = true,
    style,
    containerStyle,
    textStyle
  }: NomniBarChipButtonProps) => (

    <TouchableOSAgnostic
    testID={`NomniBarChipButton-${title}`}
    scaleTouchdownEffect={enabled !== false}
    onPress={() => (enabled === false ? null : onPress())}

    </View>
    {showCaret && <MediumIcon key={BigIcon.caret} tintColor={Style.Colors.Green.gametime} name={BigIcon.caret} />}
  </View>
</View>
</TouchableOSAgnostic>
)

export default NomniBarChipButton

