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
    inputField={{
        value: textInput,
        onChangeText: setTextInput,
        placeholder: "Enter your name",
    }}
    label="Text Input"
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
    inputType={TextInputType.Text}
    helperText="Username must be 3-20 characters"
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
    inputType={TextInputType.Password}
    helperText="Password must be at least 8 characters with uppercase, lowercase, and number"
    validateOnChange={true}
    startIcon={<Icons.CalendarDotsIcon size={20} weight="bold" color="#4B5563"/>}
/>
```

## TextInput Component - Phone Number with Validation

```ts
const [contactNumber, setContactNumber] = useState("");
const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
const [errors, setErrors] = useState<{
  contactNumber?: string;
  emergencyContactNumber?: string;
}>({});

// Mandatory phone number with validation
<TextInputComponent
    label="Contact Number *"
    inputType={TextInputType.Phone}
    inputField={{
        value: contactNumber,
        onChangeText: (text) => {
            setContactNumber(text);
            if (errors.contactNumber) {
                setErrors({ ...errors, contactNumber: undefined });
            }
        },
        placeholder: "+94 70 123 4567",
    }}
    errorText={errors.contactNumber}
/>

// Optional phone number with validation (only validates if value provided)
<TextInputComponent
    label="Emergency Contact Number"
    inputType={TextInputType.Phone}
    inputField={{
        value: emergencyContactNumber,
        onChangeText: (text) => {
            setEmergencyContactNumber(text);
            if (errors.emergencyContactNumber) {
                setErrors({ ...errors, emergencyContactNumber: undefined });
            }
        },
        placeholder: "+94 70 123 4567",
    }}
    errorText={errors.emergencyContactNumber}
/>

// Validation function for mandatory phone number
const validateContactNumber = (): boolean => {
    if (!contactNumber.trim()) {
        setErrors({ ...errors, contactNumber: "Contact number is required" });
        return false;
    }

    const cleaned = contactNumber.replace(/[\s-]/g, '');
    const phonePattern = /^\+[1-9]\d{1,14}$/;
    if (!phonePattern.test(cleaned)) {
        setErrors({
            ...errors,
            contactNumber: "Invalid phone number format. (e.g., +94701234567)",
        });
        return false;
    }
    return true;
};

// Validation function for optional phone number
const validateEmergencyContactNumber = (): boolean => {
    // Only validate if emergency contact number is provided
    if (emergencyContactNumber.trim()) {
        const cleaned = emergencyContactNumber.replace(/[\s-]/g, '');
        const phonePattern = /^\+[1-9]\d{1,14}$/;
        if (!phonePattern.test(cleaned)) {
            setErrors({
                ...errors,
                emergencyContactNumber: "Invalid phone number format. (e.g., +94701234567)",
            });
            return false;
        }
    }
    return true;
};
```

## TextInput Component - Date of Birth with Validation

```ts
const [dateOfBirth, setDateOfBirth] = useState("");
const [errors, setErrors] = useState<{ dateOfBirth?: string }>({});

<TextInputComponent
    label="Date of birth *"
    inputField={{
        value: dateOfBirth,
        onChangeText: (text) => {
            setDateOfBirth(text);
            if (errors.dateOfBirth) {
                setErrors({ ...errors, dateOfBirth: undefined });
            }
        },
        placeholder: "29/12/1998",
    }}
    errorText={errors.dateOfBirth}
/>

// Validation function for date of birth
const validateDateOfBirth = (): boolean => {
    if (!dateOfBirth.trim()) {
        setErrors({ ...errors, dateOfBirth: "Date of birth is required" });
        return false;
    }

    // Check format DD/MM/YYYY
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(dateOfBirth)) {
        setErrors({ ...errors, dateOfBirth: "Invalid date format (DD/MM/YYYY)" });
        return false;
    }

    const parts = dateOfBirth.split('/').map(Number);
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    if (!day || !month || !year) {
        setErrors({ ...errors, dateOfBirth: "Invalid date" });
        return false;
    }

    const dateObj = new Date(year, month - 1, day);

    // Check if date is valid (handles leap years automatically)
    if (
        dateObj.getDate() !== day ||
        dateObj.getMonth() !== month - 1 ||
        dateObj.getFullYear() !== year
    ) {
        setErrors({ ...errors, dateOfBirth: "Invalid date" });
        return false;
    }

    // Check if date is not in the future
    if (dateObj > new Date()) {
        setErrors({ ...errors, dateOfBirth: "Date of birth cannot be in the future" });
        return false;
    }

    return true;
};
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
    readOnly={true}
/>
```

## Dropdown Component - With Validation

```ts
const [title, setTitle] = useState("");
const [gender, setGender] = useState("");
const [errors, setErrors] = useState<{
  title?: string;
  gender?: string;
}>({});

const titleOptions = [
    { label: "Mr", value: "Mr" },
    { label: "Mrs", value: "Mrs" },
    { label: "Ms", value: "Ms" },
    { label: "Dr", value: "Dr" },
];

const genderOptions = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
];

<DropdownComponent
    label="Title *"
    value={title}
    onValueChange={(value) => {
        setTitle(value);
        if (errors.title) {
            setErrors({ ...errors, title: undefined });
        }
    }}
    options={titleOptions}
    placeholder="Select"
    errorText={errors.title}
/>

<DropdownComponent
    label="Gender *"
    value={gender}
    onValueChange={(value) => {
        setGender(value);
        if (errors.gender) {
            setErrors({ ...errors, gender: undefined });
        }
    }}
    options={genderOptions}
    placeholder="Select"
    errorText={errors.gender}
/>

// Validation function
const validateDropdowns = (): boolean => {
    const newErrors: { title?: string; gender?: string } = {};

    if (!title.trim()) {
        newErrors.title = "Title is required";
    }

    if (!gender.trim()) {
        newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
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

# Loader Component

```ts
<Loader />
```

# Checkbox Component

```ts
const [agree, setAgree] = useState(false);

<CheckboxComponent
    value="terms"
    label="I agree to the terms and conditions"
    isChecked={agree}
    onChange={setAgree}
/>
```

# RadioButton Component

```ts
const [selectedOption, setSelectedOption] = useState("option1");

<RadioGroupComponent
    value={selectedOption}
    onChange={setSelectedOption}
    options={[
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
    ]}
/>
```

# TextArea Component

```ts
const [notes, setNotes] = useState("");

<TextAreaComponent
    label="Notes"
    inputField={{
        value: notes,
        onChangeText: setNotes,
        placeholder: "Enter additional notes...",
    }}
/>
```

# DateTimePicker Component

```ts
const [dateTime, setDateTime] = useState("");

<DateTimePickerComponent
    label="Select Appointment Date & Time"
    value={dateTime}
    onChange={setDateTime}
    mode="datetime"
    placeholder="Select Date & Time"
/>
```
