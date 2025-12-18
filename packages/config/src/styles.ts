// Test the file
export const text = "Hello"

// Enums

enum Font {
    Lato = 'lato',
    DMsans = 'DMsans',
}

enum FontWeight {
  Regular = 400,
  Medium = 500,
  SemiBold = 600,
  Bold = 700,
  ExtraBold = 800,
}

enum FontStyle {
  Normal = 'normal',
  Italic = 'italic',
}


// Types

type TextStyle = {
  fontFamily: Font;
  fontSize: number;
  fontWeight: FontWeight | number;
  fontStyle: FontStyle;
  lineHeight?: number;
  letterSpacing?: number;
};

type TextMapping = {
  [category: string]: {
    [variant: string]: TextStyle;
  };
};


// Text Styles

const textStyles: TextMapping = {
  title: {

    // Title - Page
    page: {
      fontFamily: Font.Lato,
      fontSize: 36,
      fontWeight: FontWeight.SemiBold,
      fontStyle: FontStyle.Normal,
    },

    // Title – Small
    small: {
      fontFamily: Font.Lato,
      fontSize: 16,
      fontWeight: FontWeight.Bold,
      fontStyle: FontStyle.Normal,
    },

    // Title – Medium
    default: {
      fontFamily: Font.Lato,
      fontSize: 20,
      fontWeight: FontWeight.Bold,
      fontStyle: FontStyle.Normal,
    },

    // Title – Large
    large: {
      fontFamily: Font.Lato,
      fontSize: 24,
      fontWeight: FontWeight.ExtraBold,
      fontStyle: FontStyle.Normal,
    },
  },

  text: {

    // Text – Small
    small: {
      fontFamily: Font.DMsans,
      fontSize: 14,
      fontWeight: FontWeight.Regular,
      fontStyle: FontStyle.Normal,
    },

  },

  tags: {

    // Tags – Small
    small: {
      fontFamily: Font.DMsans,
      fontSize: 11,
      fontWeight: FontWeight.Regular,
      fontStyle: FontStyle.Normal,
    },

    // Tags – Medium
    medium: {
      fontFamily: Font.DMsans,
      fontSize: 12,
      fontWeight: FontWeight.SemiBold,
      fontStyle: FontStyle.Normal,
    },
 
  },

  button: {

    // Button – Small
    small: {
      fontFamily: Font.Lato,
      fontSize: 14,
      fontWeight: FontWeight.Bold,
      fontStyle: FontStyle.Normal,
    },

    // Button – Medium
    medium: {
      fontFamily: Font.DMsans,
      fontSize: 16,
      fontWeight: FontWeight.SemiBold,
      fontStyle: FontStyle.Normal,
    },

    // Button – Large
    large: {
      fontFamily: Font.DMsans,
      fontSize: 16,
      fontWeight: FontWeight.Medium,
      fontStyle: FontStyle.Normal,
    }
}

}


