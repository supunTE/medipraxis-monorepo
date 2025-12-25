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

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number");

const usernameSchema = z.string()
.min(3, "Username must be at least 3 characters")
.max(20, "Username must not exceed 20 characters")
.regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");


<TextInputComponent
value={password}
onChangeText={setPassword}
placeholder="Enter secure password"
label="Password"
inputType="password"
validationSchema={passwordSchema}
helperText="Min 8 chars with uppercase, lowercase & number"
/>

<TextInputComponent
    value={username}
    onChangeText={setUsername}
    placeholder="johndoe123"
    label="Username"
    validationSchema={usernameSchema}
    showWarning={username === "admin" || username === "test"}
    helperText="3-20 characters, letters, numbers & underscores"
/>

```

## Text Input Field - OTP

```ts
import { z } from 'zod';

const [otp1, setOtp1] = useState("");
const otpSchema = z.string().regex(/^[0-9]$/, "Must be a number");

<TextInputComponent.OTPField
value={otp1}
onChangeText={setOtp1}
validationSchema={otpSchema}
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
    helperText="Please select your country"
    showValidation={true}
/>
```
