# 🎨 SliceApp Design System

## Overview
This design system ensures consistency across the entire app. All components are reusable and changes in one place affect the entire app.

---

## 🎯 Import Components

```typescript
// Import everything from one place
import { Button, Card, Section, IconButton, H1, H2, P1, TextInput } from '../components';
import { colors, spacing, layout } from '../theme';
```

---

## 🎨 Colors

```typescript
import { colors } from '../theme';

colors.primary        // #10B981 (Tennis green)
colors.primaryDark    // #059669
colors.secondary      // #1F2937 (Dark gray)
colors.darkGrey       // #374151
colors.grey           // #6B7280
colors.lightGrey      // #D1D5DB
colors.white          // #FFFFFF
colors.error          // #EF4444
colors.success        // #10B981
colors.warning        // #F59E0B
```

---

## 📏 Spacing

```typescript
import { spacing, layout } from '../theme';

// Spacing scale
spacing.xs      // 4px
spacing.sm      // 8px
spacing.md      // 12px
spacing.lg      // 16px
spacing.xl      // 20px
spacing.xxl     // 24px
spacing.xxxl    // 32px
spacing.huge    // 40px
spacing.massive // 48px

// Layout constants
layout.screenPadding   // 16px (use for screen edges)
layout.cardPadding     // 16px (use inside cards)
layout.sectionSpacing  // 24px (use between sections)
layout.elementSpacing  // 12px (use between elements)
```

---

## 📝 Typography

```typescript
import { H1, H2, P1, ButtonText } from '../components';

<H1>Large Heading</H1>           // 35px, bold
<H2>Medium Heading</H2>          // 24px, semibold
<P1>Body text</P1>               // 16px, regular
<ButtonText>Button</ButtonText>  // 15px, medium
```

---

## 🔘 Button Component

```typescript
import { Button } from '../components';

// Primary button (default)
<Button 
  title="Sign Up" 
  onPress={handlePress} 
/>

// Variants
<Button title="Primary" variant="primary" onPress={handlePress} />
<Button title="Secondary" variant="secondary" onPress={handlePress} />
<Button title="Outline" variant="outline" onPress={handlePress} />
<Button title="Ghost" variant="ghost" onPress={handlePress} />

// Sizes
<Button title="Small" size="small" onPress={handlePress} />
<Button title="Medium" size="medium" onPress={handlePress} />  // default
<Button title="Large" size="large" onPress={handlePress} />

// States
<Button title="Loading" loading onPress={handlePress} />
<Button title="Disabled" disabled onPress={handlePress} />
<Button title="Full Width" fullWidth onPress={handlePress} />
```

---

## 🃏 Card Component

```typescript
import { Card } from '../components';

// Standard card with padding
<Card>
  <P1>Card content</P1>
</Card>

// Card without padding (for images, etc)
<Card noPadding>
  <Image source={...} />
</Card>

// Custom styling
<Card style={{ marginBottom: spacing.lg }}>
  <P1>Custom card</P1>
</Card>
```

---

## 📦 Section Component

```typescript
import { Section } from '../components';

// Section with title
<Section title="Account">
  <P1>Section content</P1>
</Section>

// Section spacing
<Section spacing="small">...</Section>   // 16px bottom margin
<Section spacing="medium">...</Section>  // 24px bottom margin (default)
<Section spacing="large">...</Section>   // 32px bottom margin
<Section spacing="none">...</Section>    // 0px bottom margin
```

---

## 🎯 IconButton Component

```typescript
import { IconButton } from '../components';

// Basic icon button
<IconButton 
  icon="cog" 
  onPress={handleSettings} 
/>

// Custom size and color
<IconButton 
  icon="pencil" 
  size={20}
  color={colors.primary}
  onPress={handleEdit} 
/>

// With background
<IconButton 
  icon="close" 
  backgroundColor={colors.lightGrey}
  onPress={handleClose} 
/>
```

---

## 📝 TextInput Component

```typescript
import { TextInput } from '../components';

// Basic input
<TextInput
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
/>

// With icons
<TextInput
  placeholder="Password"
  leftIcon="lock"
  rightIcon="eye"
  onRightIconPress={togglePassword}
  secureTextEntry
/>

// Error state
<TextInput
  placeholder="Email"
  error={!!emailError}
/>
```

---

## 🎨 Example Screen

```typescript
import React from 'react';
import { ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { H2, P1, Button, Card, Section, IconButton } from '../components';
import { colors, spacing, layout } from '../theme';

export const ExampleScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* Header with icon */}
        <View style={styles.header}>
          <H2>Screen Title</H2>
          <IconButton icon="cog" onPress={handleSettings} />
        </View>

        {/* Section with cards */}
        <Section title="Stats">
          <Card>
            <P1>Card content here</P1>
          </Card>
        </Section>

        {/* Button */}
        <Button 
          title="Continue" 
          onPress={handleContinue}
          fullWidth
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.hyperLightGrey,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.sectionSpacing,
  },
});
```

---

## ✅ Best Practices

1. **Always use spacing scale** - Never hardcode pixel values
2. **Use components** - Don't create custom buttons/cards
3. **Import from index** - `import { Button } from '../components'`
4. **Consistent colors** - Use theme colors, not hex values
5. **One source of truth** - Change design system, not individual screens

---

## 🚀 Benefits

✅ **Consistency** - Same look everywhere
✅ **Maintainability** - Change once, update everywhere  
✅ **Speed** - Build screens faster
✅ **Quality** - No design inconsistencies

