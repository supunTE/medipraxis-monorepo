# Text Component

```ts
<TextComponent variant={TextVariant.Title} size={TextSize.ExtraLarge} color={Color.Green}>
    Welcome to Medipraxis!
</TextComponent>
```

# Button Component

```ts
<ButtonComponent
    size={ButtonSize.Small}
    leftIcon={HeartIcon}
    rightIcon={StarIcon}
    buttonColor={Color.Green}
    textColor={Color.White}
    iconColor={Color.LightCream}
>
    Favorite
</ButtonComponent>
```

# Back Button

```ts
<ButtonComponent.BackButton size={ButtonSize.Medium}>Back</ButtonComponent.BackButton>
<ButtonComponent.BackButton size={ButtonSize.Small}>Home</ButtonComponent.BackButton>
<ButtonComponent.BackButton>Go To Home Page</ButtonComponent.BackButton>
```
