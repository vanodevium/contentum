import { ref } from "vue";
export default {
  setup() {
    const message = ref("Hello Contentum!");

    return {
      message: message,
    };
  },
};
