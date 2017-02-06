import Vue from 'vue'

// Vue.directive('editable', {
//   deep: true,
//   bind() {
//     // 显示display
//     this.toDisplay = (text) => {
//       this.el.innerHTML = `<span>${text}</span>`;

//       let _span = this.el.children[0];
//       _span.addEventListener('click', (event) => {
//         this.displayToInput(event.target.innerHTML);
//       })
//     }

//     // 显示input
//     this.displayToInput = (text) => {
//       this.el.innerHTML = `<input value="${text}" type="text" />`;

//       let _input = this.el.children[0];
//       _input.focus();
//       _input.value = _input.value;

//       _input.addEventListener('blur', (event) => {
//         this.toDisplay(event.target.value);
//       })
//     }
//   },
//   update(value) {
//     this.toDisplay(this.el.innerHTML);
//   },
//   unbind() {
//     // this.el.removeEventListener('click', this.buildInput)
//     // this.el.innerHTML = '123'
//     console.log(123123)
//   }
// })