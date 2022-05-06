npm <template>
  <div class="loader" />
</template>

<script>
export default {
  name: "Loader",
};
</script>

<style scoped>
.loader {
  border: 16px solid #ce2c98; /* Light grey */
  border-top: 16px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 10px;
  height: 10px;
  animation: spin 2s linear infinite;
  position: fixed;
  left: 40%;
  top: 30%;
  width: 10%;
  height: 0;
  padding-bottom: 10%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
