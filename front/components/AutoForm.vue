<template>
<form>
  <div class="input-box">
    <input type="text" />
    <div class="clear"></div>
  </div>
</form>
</template>

<script>
export default {
  data() {
    return {
      
    }
  }
}
</script>

<style>
@input-size: 2em;

form {
  width: 300px;
}

.input-box {
  position: relative;
  input {
    padding-left: 0.5em;
    padding-right: 1em;
    font-size: @input-size;
    height: @input-size;
    .box-shadow(inset 0px 0px 10px, 30%);
  }
  .clear {
    position: absolute;
    background: blue;
    width: @input-size/2;
    height: @input-size/2;
    top: @input-size/2;
    right: -40px;
  }
}
</style>