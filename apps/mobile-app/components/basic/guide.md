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

## Back Button

```ts
<ButtonComponent.BackButton size={ButtonSize.Medium}>Back</ButtonComponent.BackButton>
<ButtonComponent.BackButton size={ButtonSize.Small}>Home</ButtonComponent.BackButton>
<ButtonComponent.BackButton>Go To Home Page</ButtonComponent.BackButton>
```

# TextInput Component

```ts
<TextInputComponent
    value={textInput}
    onChangeText={setTextInput}
    placeholder="Enter your name"
    label="Text Input"
    showPasswordToggle={false}
 />
```

## TextInput Component - Password

```ts
import { z } from 'zod';

const [password, setPassword] = useState("");
const [username, setUsername] = useState("");

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");
const usernameSchema = z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores");


<TextInputComponent
    inputWrapper={{
    accessibilityHint: "Enter your username",
    }}
    inputField={{
    value: username,
    onChangeText: setUsername,
    placeholder: "Enter username",
    }}
    label="Username"
    inputType={KeyboardInputType.Text}
    validationSchema={usernameSchema}
    helperText="Username must be 3-20 characters"
    validateOnChange={true}
/>

<TextInputComponent
    inputWrapper={{
    accessibilityHint: "Enter your password",
    }}
    inputField={{
    value: password,
    onChangeText: setPassword,
    placeholder: "Enter password",
    }}
    label="Password"
    inputType={KeyboardInputType.Password}
    validationSchema={passwordSchema}
    helperText="Password must be at least 8 characters with uppercase, lowercase, and number"
    validateOnChange={true}
/>

<TextInputComponent.OTPField
    inputWrapper={{
    accessibilityHint: "Enter OTP digit",
    }}
    inputField={{
    value: otp,
    onChangeText: setOtp,
    }}
    label="Enter OTP"
    size={60}
    validationSchema={otpSchema}
/>

```

## Text Input Field - OTP

```ts
import { z } from 'zod';

const [otp, setOtp] = useState("");

const otpSchema = z
    .string()
    .length(1, "Must be a single digit")
    .regex(/^[0-9]$/, "Must be a number");

<TextInputComponent.OTPField
    inputWrapper={{
    accessibilityHint: "Enter OTP digit",
    }}
    inputField={{
    value: otp,
    onChangeText: setOtp,
    }}
    label="Enter OTP"
    size={60}
    validationSchema={otpSchema}
/>
```

# Toggle Component

```ts
const [notificationsEnabled, setNotificationsEnabled] = useState(false);
const [darkModeEnabled, setDarkModeEnabled] = useState(true);

<ToggleButton
    size={ToggleSize.Medium}
    label="Enable toggle"
    isActive={notificationsEnabled}
    onToggle={setNotificationsEnabled}
/>

<ToggleButton
    size={ToggleSize.Large}
    isActive={darkModeEnabled}
    onToggle={setDarkModeEnabled}
/>
```

# Dropdown Component

```ts
const [country, setCountry] = useState('');

const countryOptions = [
    { label: 'United States', value: 'us' },
    { label: 'United Kingdom', value: 'uk' },
    { label: 'Canada', value: 'ca' },
    { label: 'Australia', value: 'au' },
    { label: 'Germany', value: 'de' },
    { label: 'France', value: 'fr' },
    { label: 'Japan', value: 'jp' },
    { label: 'India', value: 'in' },
];

<DropdownComponent
    value={country}
    onValueChange={setCountry}
    options={countryOptions}
    label="Country"
    placeholder="Select a country"
    validationSchema={requiredSchema}
    validateOnChange={true}
/>
```

# Chip Component

```ts
<ChipComponent
    text="Penicillin allergy"
    variant={ChipVariant.Danger}
    iconName="Heart"
    iconPosition="left"
/>
<ChipComponent
    text="Warning"
    variant={ChipVariant.Warning}
    iconName="Check"
    iconPosition="right"
/>
<ChipComponent
    text="Success"
    variant={ChipVariant.Success}
    iconName="Star"
    iconPosition="left"
/>
<ChipComponent text="Light Theme" variant={ChipVariant.LightGreen} />
```
