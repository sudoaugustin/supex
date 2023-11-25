let on = false;

export default function toggleState() {
  on = !on;

  console.log(`State: ${on}`);
}

toggleState();

toggleState();
