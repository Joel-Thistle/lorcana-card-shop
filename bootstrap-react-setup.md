# Installing Bootstrap for React

## Step 1: Install the required packages

Open your terminal and run one of the following commands in your React project directory:

Using npm:
```
npm install bootstrap react-bootstrap
```

Using yarn:
```
yarn add bootstrap react-bootstrap
```

## Step 2: Import Bootstrap CSS

Add the following import statement in your `src/index.js` file:

```javascript
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
```

## Step 3: Start using Bootstrap components

You can now use Bootstrap components in your React application. Here's an example of how to use a Bootstrap Button:

```jsx
import React from 'react';
import { Button } from 'react-bootstrap';

function App() {
  return (
    <div className="App">
      <h1>React Bootstrap Example</h1>
      <Button variant="primary">Primary Button</Button>
      <Button variant="success">Success Button</Button>
      <Button variant="danger">Danger Button</Button>
    </div>
  );
}

export default App;
```

## Step 4: Using Bootstrap CSS classes

You can also use Bootstrap CSS classes directly in your JSX:

```jsx
<div className="container">
  <div className="row">
    <div className="col-md-6">
      <div className="alert alert-primary">
        This is a Bootstrap alert
      </div>
    </div>
  </div>
</div>
```

## Additional Resources

- [React-Bootstrap Documentation](https://react-bootstrap.github.io/)
- [Bootstrap Documentation](https://getbootstrap.com/)